# Acme|Co — brand brief for AI builders

**Use only the colors, fonts and rules below. Do not introduce new colors, tints, gradients or fonts unless listed here.**

Every color value in this brief is final. If a design needs a color that is not listed, use the nearest listed token instead of inventing one.

## Brand

- Name: Acme|Co
- Tagline: Build good things.

## Aesthetic: Soft Form

- Descriptor: Warm · Graphic · Tactile
- Influences: Bauhaus / Neumorphism / Prism
- Summary: Quiet, tactile surfaces that look pressed into and lifted out of the same material.
- Motto: Precise structure. Soft edges.
- Mode: dark (canvas is the dark neutral, ink is the light neutral)

## Color tokens

Define these as CSS custom properties and reference them by name. Hexes are exact; do not adjust them.

| Token | Hex | Role | Job |
| --- | --- | --- | --- |
| `--primary` | #2f5bd8 | Primary | Main action |
| `--secondary` | #8fb3e8 | Secondary | Support |
| `--accent` | #f2a33a | Accent | One spark |
| `--neutral-dark` | #14171f | Derived | Brand neutral (dark). Becomes the canvas in dark mode, the ink in light mode |
| `--neutral-light` | #f7f8fb | Derived | Brand neutral (light). Becomes the canvas in light mode, the ink in dark mode |
| `--canvas` | #1d2028 | Canvas | Background |
| `--ink` | #f7f8fb | Ink | Text & icons |
| `--muted` | #a0a2a7 | Derived | Secondary text, captions, placeholders, disabled labels |
| `--line` | #3e4048 | Derived | Hairlines, dividers, resting input borders |
| `--on-primary` | #ffffff | Derived | Text and icons on a primary fill only |
| `--on-secondary` | #141414 | Derived | Text and icons on a secondary fill only |
| `--on-accent` | #141414 | Derived | Text and icons on an accent fill only |
| `--accent-ink` | #f2a33a | Derived | The accent as text: same hue, shaded (light canvas) or tinted (dark canvas) just enough to reach 3:1 on the canvas. Set the highlight word in it, never plain accent |
| `--pri-tint` | #1f273d | Derived | Quiet primary wash: selected state background, hover on primary-linked items |
| `--sec-tint` | #2f3847 | Derived | Quiet secondary wash: selected row, tonal fills, hover on secondary items |

Canvas is derived from Neutral dark and then adjusted by the Soft Form aesthetic. Use `--canvas`, not the raw neutral, for page and panel backgrounds.

## Where each color goes

### Canvas (#1d2028): Background

- Use for: Page and panel backgrounds, same-material controls
- Never for: Text
- Coverage: 60–70%

### Ink (#f7f8fb): Text & icons

- Use for: Headlines, body text, hairlines (as a tint) and the selected-segment fill
- Never for: Large background fields in light mode
- Coverage: 15–20%

### Primary (#2f5bd8): Main action

- Use for: The one glossy action per view and the "on" state of switches
- Never for: Body text, flat decoration, a second CTA
- Coverage: ≈10%

### Secondary (#8fb3e8): Support

- Use for: Secondary buttons, tags and chips, a second data series, supporting illustration, selected-row tint
- Never for: The main CTA, body text, page background
- Coverage: ≈10–15%

### Accent (#f2a33a): One spark

- Use for: One highlight per view: a headline word, a "new" badge, the focal point of the art
- Never for: Buttons, body text, borders, large fills
- Coverage: ≤5%

### Hard rules

1. Exactly one primary-filled action (the main call to action) per view.
2. Secondary never fills the main call to action and never sets body text.
3. Accent covers ≤5% of any view and is never used on buttons, body text or borders.
4. Text is set only in `--ink`, `--muted` or the matching `--on-*` token on its fill. The one exception is the single accent highlight word, and only where the highlight treatment below says so.
5. Color budget per view: canvas 60–70%, ink 15–20%, primary ≈10%, secondary ≈10–15%, accent ≤5%. Stay inside it.
6. No other colors, tints or gradients. Hover and pressed states use only the tokens above (for example `--pri-tint`, `--sec-tint`) or the shadows and overlays listed under Materials.
7. Focus ring is `--primary` (3px) with an outer 1px `--ink` ring, because `--primary` alone is under 3:1 on this canvas.
8. The highlight word is set as text in `#f2a33a` (`--accent-ink`), which is the accent itself, at 7.81:1 on the canvas. Use it once per view; never set plain `--accent` as text.

## Component color map

Which token goes where. Shadows, blur and borders beyond these tokens come from Materials.

| Element | Background | Text | Border / edge |
| --- | --- | --- | --- |
| Page | --canvas | --ink | none |
| Card / panel | --canvas | --ink | --line |
| Primary button (one per view) | --primary | --on-primary | none |
| Secondary button | transparent (hover: --sec-tint) | --ink | --secondary |
| Ghost / tertiary link | none | --ink (underlined) | none |
| Input field, rest | --canvas | --ink (placeholder: --muted) | --line |
| Input field, focus | --canvas | --ink | --primary (plus a 3px ring of --primary at 40% opacity) |
| Segmented control, selected | --ink | --canvas | none |
| Segmented control, unselected | transparent | --muted | none |
| Toggle, on | track --canvas (recessed), knob --primary | --ink (label) | none |
| Toggle, off | track --canvas (recessed), knob --muted | --ink (label) | none |
| Tag / chip | --secondary | --on-secondary | none |
| Badge ("New", notification) | --accent | --on-accent | none |
| Headline highlight word (one per view) | none | --accent-ink | none |
| Divider / hairline | --line | n/a | n/a |
| List row, selected | --sec-tint | --ink | left edge 2px --primary |
| List row, resting | transparent | --ink (meta: --muted) | bottom 1px --line |
| Progress / data bar | track --line | n/a | fill --primary (second series: --secondary) |
| Focus ring (any control) | n/a | n/a | 3px --primary with an outer 1px --ink ring (primary alone is under 3:1 on this canvas) |

## Contrast pairs

| Pair | Foreground | Background | Ratio | Grade | Use |
| --- | --- | --- | --- | --- | --- |
| --ink on --canvas | #f7f8fb | #1d2028 | 15.34:1 | AAA | Body and headlines |
| --muted on --canvas | #a0a2a7 | #1d2028 | 6.38:1 | AA | Captions and secondary text |
| --on-primary on --primary | #ffffff | #2f5bd8 | 5.82:1 | AA | Primary button label |
| --on-secondary on --secondary | #141414 | #8fb3e8 | 8.58:1 | AAA | Chip and tag label |
| --on-accent on --accent | #141414 | #f2a33a | 8.84:1 | AAA | Badge label, highlight band |
| --accent-ink on --canvas | #f2a33a | #1d2028 | 7.81:1 | AAA | Highlight word and accent text (the accent shaded to 3:1) |
| --accent on --canvas | #f2a33a | #1d2028 | 7.81:1 | AAA | Graphics and fills |
| --primary on --canvas | #2f5bd8 | #1d2028 | 2.80:1 | FAIL | Graphics only; keep the label in --on-primary |

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

## Materials (Touch & depth)

Surface recipes for this aesthetic with real values filled in. Apply them as written.

- **Recessed well**: background: #1d2028; border-radius: 50%; box-shadow: inset 9px 9px 20px rgba(0,0,0,0.53), inset -9px -9px 20px rgba(255,255,255,0.07);
- **Raised control**: background: #1d2028; box-shadow: 6px 6px 13px rgba(0,0,0,0.53), -6px -6px 13px rgba(255,255,255,0.07);
- **Recessed field**: background: #1d2028; box-shadow: inset 6px 6px 13px rgba(0,0,0,0.53), inset -6px -6px 13px rgba(255,255,255,0.07); border-radius: 12px;
- **Glass panel**: background: linear-gradient(135deg, rgba(255,255,255,0.07), transparent 48%), #1d2028; border: 1px solid rgba(255,255,255,0.44); border-radius: 24px; box-shadow: inset 1px 1px 2px rgba(255,255,255,.5), inset -1px -1px 2px rgba(255,255,255,.15), 6px 9px 20px rgba(0,0,0,0.53), -4px -4px 12px rgba(255,255,255,0.07); /* plus a 1.5px iridescent ring: white, cyan, lilac, peach */
- **Primary action**: background: linear-gradient(180deg, rgba(255,255,255,.15), transparent 55%), #2f5bd8; color: #ffffff; border: 1px solid rgba(255,255,255,.27); border-radius: 10px; box-shadow: inset 0 1px 1px rgba(255,255,255,.44), 3px 5px 9px rgba(0,0,0,.13);
- **Selected segment**: background: #f7f8fb; color: #1d2028; border-radius: 9px; box-shadow: 2px 3px 5px rgba(0,0,0,.13); /* sits in a recessed track, radius 12, padding 5 */
- **Switch**: track: recessed 50x29, radius 20, inset 3px 3px 6px rgba(0,0,0,0.53), inset -3px -3px 6px rgba(255,255,255,0.07); knob: linear-gradient(145deg, rgba(255,255,255,.7), transparent 55%) over #a0a2a7 (off) or #2f5bd8 (on), shadow 1px 2px 4px rgba(0,0,0,.2).

## Do

- Fill raised and recessed surfaces with the canvas color itself; the paired shadow and highlight make the form.
- Light everything from the top left, always: dark shadow down-right, light highlight up-left.
- Give each control one material: recessed for fields and tracks, raised for buttons, glossy for the one primary action.
- Keep dense rows and body text flat so the few tactile surfaces read.

## Don't

- Fill a raised element with a different color; that makes it a card, not Soft Form.
- Move the light with the pointer, scroll or time, or add idle shimmer.
- Use a plain frosted blur as glass; the iridescent rim must be visible.
- Add decorative circles or arcs to the product UI itself; keep geometry to the signature art.

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

/* Derived tokens for the dark-mode Soft Form aesthetic. Computed, do not edit. */
:root {
  --canvas: #1d2028;
  --ink: #f7f8fb;
  --muted: #a0a2a7;
  --line: #3e4048;
  --on-secondary: #141414;
  --accent-ink: #f2a33a;
  --pri-tint: #1f273d;
  --sec-tint: #2f3847;
}

/* Soft Form material variables, referenced by the Materials above. */
:root {
  --ab-hi: rgba(255,255,255,0.07);
  --ab-lo: rgba(0,0,0,0.53);
  --ab-rim: rgba(255,255,255,0.44);
  --ab-gloss: rgba(255,255,255,0.07);
  --ab-canvas-a: rgba(29,32,40,0.7);
}
```
