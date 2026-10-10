# Acme|Co — brand brief for AI builders

**Use only the colors, fonts and rules below. Do not introduce new colors, tints, gradients or fonts unless listed here.**

Every color value in this brief is final. If a design needs a color that is not listed, use the nearest listed token instead of inventing one.

## Brand

- Name: Acme|Co
- Tagline: Build good things.

## Aesthetic: Neo-Brutal Pop

- Descriptor: Chunky · Playful · Loud
- Influences: Neo-brutalism / Memphis / Sticker culture
- Summary: Big outlines, bright stickers and buttons that squish when you press them.
- Motto: Loud, but friendly.
- Mode: light (canvas is the light neutral, ink is the dark neutral)

## Color tokens

Define these as CSS custom properties and reference them by name. Hexes are exact; do not adjust them.

| Token | Hex | Role | Job |
| --- | --- | --- | --- |
| `--primary` | #c2410c | Primary | Main action |
| `--secondary` | #e9c46a | Secondary | Support |
| `--accent` | #f4e04d | Accent | One spark |
| `--neutral-dark` | #1b1410 | Derived | Brand neutral (dark). Becomes the canvas in dark mode, the ink in light mode |
| `--neutral-light` | #faf5ee | Derived | Brand neutral (light). Becomes the canvas in light mode, the ink in dark mode |
| `--canvas` | #f6ead1 | Canvas | Background |
| `--ink` | #1b1410 | Ink | Text & icons |
| `--muted` | #685f54 | Derived | Secondary text, captions, placeholders, disabled labels |
| `--line` | #d5cab4 | Derived | Hairlines, dividers, resting input borders |
| `--on-primary` | #ffffff | Derived | Text and icons on a primary fill only |
| `--on-secondary` | #141414 | Derived | Text and icons on a secondary fill only |
| `--on-accent` | #141414 | Derived | Text and icons on an accent fill only |
| `--accent-ink` | #958409 | Derived | The accent as text: same hue, shaded (light canvas) or tinted (dark canvas) just enough to reach 3:1 on the canvas. Set the highlight word in it, never plain accent |
| `--pri-tint` | #f0d6b9 | Derived | Quiet primary wash: selected state background, hover on primary-linked items |
| `--sec-tint` | #f4e4c1 | Derived | Quiet secondary wash: selected row, tonal fills, hover on secondary items |
| `--ab-card-fill` | #f0d79e | Aesthetic | Aesthetic-specific color used by the Materials below |
| `--ab-paper` | #fefdfa | Aesthetic | Aesthetic-specific color used by the Materials below |

Canvas is derived from Neutral light and then adjusted by the Neo-Brutal Pop aesthetic. Use `--canvas`, not the raw neutral, for page and panel backgrounds.

## Where each color goes

### Canvas (#f6ead1): Background

- Use for: Page and panel backgrounds, same-material controls
- Never for: Text
- Coverage: 60–70%

### Ink (#1b1410): Text & icons

- Use for: Every outline, the hard offset shadows, headlines and body text
- Never for: Large background fields in light mode
- Coverage: 15–20%

### Primary (#c2410c): Main action

- Use for: The one chunky CTA per view (the card button), the selected segment, the flower sticker and the "on" toggle
- Never for: Card fills, body text, a second filled CTA (the hero button is paper)
- Coverage: ≈10%

### Secondary (#e9c46a): Support

- Use for: Tags and chips, sticker circles, progress stripes and the second data series
- Never for: Card or panel fills (those are paper), the main CTA, body text
- Coverage: ≈12%

### Accent (#f4e04d): One spark

- Use for: The headline word as a color fill with a 2px ink outline, the starburst sticker and one avatar
- Never for: Buttons, body text, outlines, large fills
- Coverage: ≤5%

### Hard rules

1. Exactly one primary-filled action (the main call to action) per view.
2. Secondary never fills the main call to action and never sets body text.
3. Accent covers ≤5% of any view and is never used on buttons, body text or borders.
4. Text is set only in `--ink`, `--muted` or the matching `--on-*` token on its fill. The one exception is the single accent highlight word, and only where the highlight treatment below says so.
5. Color budget per view: canvas 60–70%, ink 15–20%, primary ≈10%, secondary ≈12%, accent ≤5%. Stay inside it.
6. No other colors, tints or gradients. Hover and pressed states use only the tokens above (for example `--pri-tint`, `--sec-tint`) or the shadows and overlays listed under Materials.
7. Focus ring is always `--primary`.
8. In this aesthetic the highlight word is a highlighter band: background `#f4e04d` (`--accent`) behind the word, text in `#141414` (`--on-accent`). Never set accent-colored text.

## Component color map

Which token goes where. Shadows, blur and borders beyond these tokens come from Materials.

| Element | Background | Text | Border / edge |
| --- | --- | --- | --- |
| Page | --canvas | --ink | none |
| Card / panel | --ab-paper (#fefdfa) | --ink | --ink |
| Primary button (one per view) | --primary | --on-primary | --ink |
| Secondary button | transparent (hover: --sec-tint) | --ink | --secondary |
| Ghost / tertiary link | none | --ink (underlined) | none |
| Input field, rest | --canvas | --ink (placeholder: --muted) | --ink |
| Input field, focus | --canvas | --ink | --primary (plus a 3px ring of --primary at 40% opacity) |
| Segmented control, selected | --primary | --on-primary | --ink |
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
| --ink on --canvas | #1b1410 | #f6ead1 | 15.26:1 | AAA | Body and headlines |
| --muted on --canvas | #685f54 | #f6ead1 | 5.25:1 | AA | Captions and secondary text |
| --on-primary on --primary | #ffffff | #c2410c | 5.18:1 | AA | Primary button label |
| --on-secondary on --secondary | #141414 | #e9c46a | 11.03:1 | AAA | Chip and tag label |
| --on-accent on --accent | #141414 | #f4e04d | 13.70:1 | AAA | Badge label, highlight band |
| --accent-ink on --canvas | #958409 | #f6ead1 | 3.15:1 | AA large text only | Highlight word and accent text (the accent shaded to 3:1) |
| --accent on --canvas | #f4e04d | #f6ead1 | 1.13:1 | FAIL | Do not use as text; graphic fills only |
| --primary on --canvas | #c2410c | #f6ead1 | 4.34:1 | AA large text only | Focus ring, graphics, large elements |

AAA is 7:1, AA is 4.5:1 for body text, "AA large text only" is 3:1 for text of 24px or 19px bold and up.

## Typography

- Heading font: Playfair Display (serif); CSS: `"Playfair Display", Georgia, serif`
- Body font: Source Serif 4 (serif); CSS: `"Source Serif 4", Georgia, serif`
- Google Fonts: https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Serif+4:wght@400;600&display=swap
- Headings: 44px, weight 700, letter-spacing 0px, text-transform none
- Body: 16px, weight 400, letter-spacing 0px, text-transform none
- Interface text (tabs, buttons, field values, list cells): Playfair Display. The Source Serif 4 body face is for reading copy only.
- Small labels and captions: Playfair Display.
- Shape: Minimal & Sharp, radius 4px, large radius 6px

## Materials (Stickers & squish)

Surface recipes for this aesthetic with real values filled in. Apply them as written.

- **Sticker card**: background: #fefdfa; /* near-white paper, never the secondary */ border: 2px solid #1b1410; border-radius: 10px; box-shadow: 4px 4px 0 #1b1410;
- **Chunky button**: background: #c2410c; color: #ffffff; border: 2px solid #1b1410; border-radius: 6px; box-shadow: 4px 4px 0 #1b1410; font-weight: 700; /* lift: translate(-2px,-2px) + 6px 6px 0; squish: translate(4px,4px), no shadow */
- **Paper button**: background: #fefdfa; color: #1b1410; border: 2px solid #1b1410; border-radius: 6px; box-shadow: 4px 4px 0 #1b1410; font-weight: 700; /* secondary button, e.g. the hero CTA */
- **Squish state**: transform: translate(4px, 4px); box-shadow: 0 0 0 #1b1410;
- **Segment track**: background: #fefdfa; border: 2px solid #1b1410; border-radius: 10px; padding: 4px; /* selected segment: #c2410c fill, 2px #1b1410 outline, radius 6 */
- **Highlight fill**: background: #f4e04d; color: #141414; border: 2px solid #1b1410; border-radius: .12em; padding: 0 .18em; box-shadow: 4px 4px 0 #1b1410; /* a color fill with a 2px ink outline behind one headline word */
- **Canvas**: background-color: #f6ead1; background-image: linear-gradient(rgba(27,20,16,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(27,20,16,0.07) 1px, transparent 1px); background-size: 32px 32px; /* the canvas is the secondary mixed into the light neutral; the grid is ink at 7% */
- **Outlined toggle**: track: 64x34, radius 8, background #fefdfa, border 2px solid #1b1410; knob: 23px, radius 5, of #1b1410; on = track #c2410c.

## Do

- Outline every object in ink at 2px and give it a hard 4px offset shadow with no blur; keep corners near-square (6px controls, 10px cards).
- Make buttons physical: lift 2px up-left on hover, squish 4px down-right on press.
- Fill cards, panels and list rows with near-white paper, sit them on the colored 32px grid canvas, and keep the headline mixed case at weight 800.
- Put the accent as a color fill with a 2px ink outline behind one headline word and in the starburst sticker.

## Don't

- Blur a shadow or add a gradient; stickers are flat color with a hard edge.
- Use the accent as text color or as a button fill.
- Round corners past 10px or rotate controls; only decorative stickers tilt.
- Drop the ink outline from a filled shape, or mix thin and thick outlines.

## CSS variables

```css
:root {
  --primary: #c2410c;
  --secondary: #e9c46a;
  --accent: #f4e04d;
  --neutral-dark: #1b1410;
  --neutral-light: #faf5ee;
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

/* Derived tokens for the light-mode Neo-Brutal Pop aesthetic. Computed, do not edit. */
:root {
  --canvas: #f6ead1;
  --ink: #1b1410;
  --muted: #685f54;
  --line: #d5cab4;
  --on-secondary: #141414;
  --accent-ink: #958409;
  --pri-tint: #f0d6b9;
  --sec-tint: #f4e4c1;
}

/* Neo-Brutal Pop material variables, referenced by the Materials above. */
:root {
  --ab-card-fill: #f0d79e;
  --ab-paper: #fefdfa;
  --ab-grid: rgba(27,20,16,0.07);
}
```
