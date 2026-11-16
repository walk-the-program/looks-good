# Defaults ledger

Reflexes that make a UI look like every other generated UI. None is banned. Each needs a decision in
section 7 of `direction.md`: keep it with a reason in this product's terms, or change it and name
the replacement. The critic marks an unargued default on a key screen as a P2.

## Contents
1. Type
2. Surfaces and shape
3. Colour
4. Actions and data
5. Layout and states

## 1. Type

- **One neutral sans for everything** (Inter, DM Sans, Geist, Manrope, SF). Reads as no decision.
  Keep only if the product's voice really is neutral and the scale, weights and spacing carry the
  character instead.
- **Tracked uppercase micro-labels above values.** The most common tell of a generated screen.
  Keep for one role at most (section labels), never on names or values. Often the value explains
  itself ("EDP", "2003") and the label can go.
- **Section headers as one plain word** ("Notes", "Details", "Settings"). Use the product's own
  words, or let structure say it and drop the header.

## 2. Surfaces and shape

- **Every group in a card, all cards the same fill and radius.** Equal boxes flatten hierarchy and
  look like a wireframe. Box only things the user acts on as a unit; group the rest with space.
- **Radius 12 to 20 on everything.** The default rounded rectangle. Pick a radius family for a
  reason in the thesis, and vary it by role if that serves (square labels, round controls).
- **A hairline under every row.** Rules where spacing would do. Keep rules where they are part of
  the world (a ledger, a diary), and then make them deliberate.
- **Soft blurred drop shadow** (about 0 4px 12px at 8%). Shadow as filler. Use depth only if the
  material model needs it, with one light source.
- **Chips for every tag.** A row of pills is noise. Ask what the tags are: often a colour, a
  position or plain text with separators says it better.

## 3. Colour

- **Off-white canvas, near-black ink, one muted accent** (brass, sage, terracotta). The house style
  of tasteful-by-default. Keep only if the content brings its own colour and the chrome should
  disappear, and then say so.
- **Grey tint as the selected state.** Weak and often invisible in dark mode. Selection should read
  without colour: weight, a mark, an edge, or the style's signature material.

## 4. Actions and data

- **Full-width pill primary button inside the content.** On a Mac it is a phone pattern; on any
  screen it competes with the content. Put the main action where the platform expects it.
- **An icon on a button that adds no meaning** (an arrow on Save). Icons where text is enough are
  decoration. Keep an icon only when it says something the label does not.
- **Numbers in stat tiles.** The dashboard reflex. Ask what the numbers are (see "Content shape" in
  `thinking.md`): parts of a whole, a trend, one number that matters, a count nobody needs.
- **Ratings as text glyphs** (★★★★☆). Draw the rating in the style's own shape, at a size that
  matches its importance.

## 5. Layout and states

- **A Mac window drawn as one centred column.** The renderer's default, and a phone in a window. A
  Mac app uses its width: sidebar, content, sometimes an inspector, a grid. Mock it when the
  renderer cannot draw it.
- **Empty state as "No X yet" plus a button.** The most skipped screen. Write it in the product's
  voice and show what the screen will become.
