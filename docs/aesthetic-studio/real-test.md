# Real test: making Seed Packet in the studio (2026-11-07)

A new style made the way a studio would: from Blank in the app, two rounds in the editor, then the
exported file handed to a fresh agent for round 3 with no instructions beyond "Here's my style file.
Do the next round." Then the agent's round was imported back with Replace and reviewed in the editor.

Brief: **Seed Packet**. Core trick: "Every surface is a printed paper packet: kraft stock, a
rubber-stamped ink label, and a perforated tear line where a card meets its footer."

## What happened

| Round | By | What |
|---|---|---|
| 1 | studio | Identity filled in, kraft canvas (`warm-paper-canvas`), shadow move removed, perforated tabs and double rule added, slab and typewriter faces, voice lines. Variations: kept a heavier print border, killed glossy checks and raised relief. Three notes pinned: the trick isn't on the board, the art is a placeholder, the buttons are a generic blue slab. |
| 2 | studio | Variations on Corners and edges: kept square corners, killed two. One note: palette chips should read as printed swatches. |
| 3 | agent | Wrote four generic moves (`tear-line`, `stamped-label`, `ink-stamp`, `tear-edge` in `js/moves/printed-stock.js`), a botanical engraving for the hero, stamped buttons, printed palette chips. All four notes done, three new notes raised. Checker: 9 pass static, 19 pass render, 0 fail. |
| 4 | studio | Imported with Replace; the editor showed "Round 3 from an agent is waiting for review", the round's changes and variants, the new notes, and the four done notes. Variations ran on the imported style with no errors. |

Board before and after the agent round: [round2-board-light.png](real-test/round2-board-light.png),
[round3-board-light.png](real-test/round3-board-light.png). The bundle as it stands:
[seed-packet.aesthetic.json](real-test/seed-packet.aesthetic.json).

The loop works end to end, and it shows the same thing as the Darkroom test: the studio's rounds got
the materials and type right, but the core trick only landed when the notes pushed for it and the agent
could write new moves. The catalog had nothing for a perforated tear line or a rubber stamp.

## Found and fixed

In the editor (seen while using it):

1. **A second background recipe did nothing, silently.** Two canvas recipes both set the canvas; the
   first wins, so the kraft dial moved and the preview never changed. Entries that aren't in effect now
   say so ("Not in effect: tinted-neutral-canvas above already sets the canvas…"), and the picker tags
   them.
2. **Neutral preview colours jittered.** The neutral palette was regenerated with random values on
   every redraw, so before/after comparisons differed by colour noise. It is now the checker's pinned
   brand, computed once (editor and Styles home).
3. **Stale Specimen copy fields.** Editing Motto or Kicker updated the spec but not the Specimen copy
   fields under them; typing there later would have written old text back. They refresh now.
4. **Variant ids didn't match the cards.** Keeping card b first recorded it as `r2a`. Ids now follow the
   card letter, and a second batch in the same round continues the letters.
5. **Blank printed template text on the board.** "KICKER ABOVE THE HEADLINE", "Word · Word · Word" and
   similar were real values. The Blank starter now has real defaults or empty fields with the hints as
   placeholders; the summary starts as the core trick.
6. **Change log used field paths** (`meta.fonts.heading.picks changed`, `build.cls`). It now reads in
   plain words (`heading fonts: Archivo Black, Inter Tight → Alfa Slab One, Rye`).
7. **Unnamed controls.** The Light / Dark differ checkboxes were announced as "on"; the axis and note
   selects now have names.

From the agent's report (15 friction points; the ones that mattered):

8. **Kit-only materials got no tokens.** A move used only as a kit material never ran its `tokens()`,
   so `ink-stamp` fell back to defaults and failed contrast 12 times. A studio picking that material in
   the Kit panel would have hit it with no clue. The runtime now runs those tokens too.
9. **Template text passed the checker.** It now warns on leftover template sentences.
10. **Guide gaps:** where shots go for a scratch folder, SVG paper and ink colours belong together, what
    `tokens()` receives, when to refresh descriptive fields after a material change, the check → render →
    pack order, and stale "lab only" comments in the move files.

## Rounds 4 and 5

| Round | By | What |
|---|---|---|
| 4 | studio | Kraft held in dark mode with the per-mode dial (warm the dark canvas, dark cream set to a deep brown). Rewrote the font note and the do / don't rules. Type Variations: kept wider label tracking. Two notes: the canvas chip vanishes, and the deck cover's striped band belongs to another look. |
| 5 | agent | Every open note done: one tear line on the deck cover with room before the footer, larger and fewer flecks at the stamp's edge, build notes rewritten, keylined palette chips (`swatch-keyline`), and a perforated "Lot 14 · 2027 season · Tear off and keep" coupon at the foot of the cover (`coupon-foot`). Static 0 fail 0 warn, render 0 fail. Two new notes. |
| 6 | studio | Imported with Replace; a snapshot of round 5 was saved on import, the review banner showed, and Compare with round 4 worked. |

Board: [round5-board-light.png](real-test/round5-board-light.png),
[round5-board-dark.png](real-test/round5-board-dark.png); deck cover:
[round5-deck-dark.png](real-test/round5-deck-dark.png); compare: [studio-compare-round4.jpg](real-test/studio-compare-round4.jpg).

Found and fixed in rounds 4 and 5:

11. **Build notes weren't editable.** Surface, press behaviour, icons and app icon now sit in the
    Identity panel, so a studio can clear the checker's template-text warning itself.
12. **Change log noise.** A per-mode dial now logs one line with its start and end state; list edits
    (rules, font picks) say `added "…"` / `removed "…"` instead of two identical truncated values.
13. **Variations repeated themselves.** A Type batch gave three label tweaks, two on the same dial. A
    batch now never changes the same setting twice and mixes in label face, UI face and display size.
14. **Imported agent rounds had no snapshot**, so Compare and Go back couldn't reach them. Replacing
    a style on import now saves one for the incoming round.
15. **The editor could scroll itself off screen** when a field was focused. At desktop widths it is now
    fixed to the window and only its panels scroll.
16. **Imported styles couldn't turn off the deck cover band** (`deck.coverBand` was refused), so the
    agent had to hide it with CSS. It is now allowed as true/false.
17. **Guide:** add script tags after the last move file; refresh do / don't rules with other
    descriptive fields; record values tried and dropped when a variant is tuned before keeping.

## Still open

- Seed Packet's notes n10 (an edge fleck can sit beside the label on small buttons) and n11 (the
  coupon has one line; it can now use `deck.coverBand: false` instead of hiding the band with CSS).
- The hero engraving's "Fig. 1" caption drifts beside the stem at deck size.
- Round 3 has no snapshot (it was imported before fix 14).
- Below 1200px wide the editor still scrolls as a page.
