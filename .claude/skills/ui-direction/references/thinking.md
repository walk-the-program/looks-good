# How to think a direction through

## Contents
1. The order of thought
2. Product truth
3. Content shape: where non-generic design comes from
4. The world: borrow mechanisms, not pictures
5. Thesis, tension, signature, principles
6. Three directions that disagree
7. System decisions, layout first
8. When the brief says simple, clean or minimal
9. When the renderer cannot draw the idea
10. Worked example: Stride, a training log
11. Signatures that worked for this owner

## 1. The order of thought

Product, then content, then world, then thesis, then three directions, then the system, then values.
Generic UI comes from running this backwards: opening the style list, picking a material, then
fitting the product into it. Do not run `lg.js styles`, `style` or `compare` until section 4 of
`direction.md` is written. Those commands help you build a direction, not find one.

## 2. Product truth

Answer from the app's own docs (`docs/product/one-pager.md`, `ux-brief.md`, `decisions.md`,
`design/directions/ROUNDS.md`) and the real app if it runs. Ask the owner only what the docs cannot
answer.

- **Who and when.** "Fragrance lovers" is a market. "In the evening, at the shelf, deciding what to
  wear tomorrow, five minutes" is a moment, and moments decide layout and density.
- **The moment that matters.** Most apps have one: logging a run while out of breath, finding a
  file in two seconds, the instant Youch! starts listening. Design that moment first; every other
  screen supports it.
- **Should feel / must never feel.** Use the owner's words, not adjectives you would pick anyway.
  "Must never feel" is often more useful: it names the trap.

## 3. Content shape: where non-generic design comes from

Templates look alike because they draw every product's data the same way: a label, a value, a
card. Products look like themselves when their content takes a form that says what it is.

For each object, ask what it really is, then draw that:

| Nature of the data | Generic form | Shaped form |
| --- | --- | --- |
| Parts of a whole, with weights | number tiles, percentages | one bar split by weight, a chord of colours |
| A sequence over time | table, list of dates | position on a line, a rhythm of bars |
| A single number that matters | stat tile among others | one numeral set large, everything else small |
| Tiers or layers | run-on text, bullets | stacked bands in their real order |
| A rating | glyph stars | a scale of marks drawn in the style's own shape |
| A thing with a natural colour | grey card with a coloured dot | the colour as the object's surface |
| A physical size or format | a word ("Sample") | a mark whose size is the format |
| A state (owned, wanted, liked) | a chip | position, weight or presence on the shelf |

If the product's data already carries colour or shape (scents, album art, map tiles, photos), that
content is the hero and the chrome steps back to neutral. Scent Box's purpose line says each scent's
accords have their own colour; a direction that leaves those colours out has dropped the product.

## 4. The world: borrow mechanisms, not pictures

Every product belongs to a world outside software: perfume has apothecary labels, scent strips, the
perfumer's organ; running has training diaries, race bibs, lane lines; files have cabinets, tabs and
index cards. List three to five real artifacts and, for each, name the mechanism you would take:
how it organises, labels, orders or reveals.

- Mechanism: a race bib sets one number huge with tiny text around it. That becomes the run screen's
  hierarchy.
- Picture: a bib illustration in the header. That is board art, and art never goes on app screens.

Then name two or three apps people in this category already use. For each, say which convention
you keep (people expect it) and which you break (that is where the character goes).

## 5. Thesis, tension, signature, principles

**Thesis.** One sentence with three parts: what the eye goes to, the mechanism that makes it, what
steps back.
- Weak: "Clean, minimal, soft tiles on a quiet ground." It names a material and no product.
- Strong: "The week is the page: every screen is laid out like a training-diary spread, with the
  run's one number as large as a race bib and everything else in small ruled type."

**Tension.** Two words that pull against each other, and which side wins where. The owner's briefs
are often already a tension ("a slight bit of character, but very proficient"). The tension tells
you where to spend boldness and where to hold back: character goes into the signature and the
display type; proficiency goes into layout, lists and forms.

**Signature.** The one thing a person would mention when describing the app to a friend. It comes
from the product's content or core action, never from a material or decoration. One per screen at
most, and some screens have none. Test: cover the logo; does the signature alone say which app
this is?

**Principles.** Three to five rules that settle future arguments, written as decisions:
"Colour belongs to the scents; the interface owns none." "One number per screen is large; nothing
else competes." A principle nobody could disagree with ("be consistent") settles nothing; cut it.

## 6. Three directions that disagree

Write three directions before rendering anything. Each is a full answer to the thesis question,
committed all the way, not a hedge between the other two. They must differ on at least three of:
structure, type, colour strategy, material, density, signature. Three recolours of one layout
count as one direction.

A spread that works:
- **The convention, done exceptionally.** What the best app in the category would do, with the
  craft turned up.
- **The world, taken literally.** The strongest artifact from section 3 drives structure and type.
- **The lateral move.** A surprising but defensible answer: a different structure, an unexpected
  type voice, the content as the whole interface.

The owner has picked the loudest option more than once (Sticker Book for NFELO, Retro Special for
Tracy Christmas), so do not tame direction C to make A look safe.

## 7. System decisions, layout first

Decide in this order; each later choice serves the earlier ones. For each, the reflex to avoid is
in `defaults-ledger.md`.

**Layout.** Navigation follows use frequency: what is used every session is one click away, the rest
is tucked. Density follows session length: quick capture is sparse with one action; a collection
you browse is a gallery; a tool for work is dense. A Mac window is not a phone column: sidebar,
content, and sometimes an inspector; actions in the toolbar; the width used for columns or a grid.
The primary action sits where the platform expects it (Mac: the toolbar's trailing edge or the
bottom of a sheet; iPhone: the bottom bar or the navigation bar), not as a slab mid-content.

**Type.** Choose families for the product's voice, and write the reason in the product's terms
("the house names are printed labels, so a narrow serif in small caps"). A screen with a hero needs
real scale contrast: the hero at least two and a half times the body size. Give every text style
one job; tracked capitals, if used, belong to one role only and never to names or values. Numbers
that line up are tabular.

**Colour.** Pick one strategy and say it in a sentence:
- content-led: the content carries the colour, the chrome is neutral;
- brand-led: neutral ground, the primary on the one main action, one spark per view;
- state-led: colour means status (effort, due, error) and nothing else;
- tonal: one hue in many steps, no accent.
Dark mode is designed, not inverted: surfaces step up in lightness, brand colours lose a little
saturation, content colours stay true.

**Material and shape.** One surface for doing (buttons, fields, switches), one for holding (lists,
cards, sheets). Box things only when they are objects the user acts on as a unit; group everything
else with space and alignment. Pick a radius family for a reason tied to the thesis (labels are
square-cornered; pebbles are round) and use it everywhere.

**Motion.** Decide three moments: press, select, and the signature moment. Most motion should be
fast and quiet. The signature may move more, if moving says something (Youch!'s static circle shows
listening, and disappears when it stops).

**Words.** Use the product's vocabulary ("Shelf", "Wear today", "Sample"), not the developer's
("Items", "Details", "Save"). Empty and first-run states are part of the direction: write them.

**Craft.** One strong edge everything aligns to. Inner gaps clearly smaller than outer gaps, so
groups read without boxes. Selected and focus states that read without colour. One icon set, one
stroke weight, icons only where they add meaning.

## 8. When the brief says simple, clean or minimal

Minimal means fewer ideas done better, never no ideas. Remove chrome, boxes, labels and colours that
have no job, and keep the one strong idea. A minimal screen lives or dies on type, spacing and
alignment, so those get more care, not less. The Scent Box note "even simpler, probably more bento
box" became uniform grey boxes, and the owner called it cheap. The better answer: fewer elements,
the scent colours as the only colour, a strong type scale, and a real grid on the Mac width.

## 9. When the renderer cannot draw the idea

The product-sheet renderer draws ranked blocks in one column with the style's kit. It cannot draw a
custom chart, a multi-column Mac layout, a colour chord, or most signature moments. That is a limit
of the preview, not of the design. Never drop an idea because the renderer cannot show it:

1. Push the renderer first: use every block type that fits (`hero-numeral`, `tiles`, `chart`,
   `progress`, `callout`, `> ` selected rows, `pin: bottom`, `highlight`).
2. For what it still cannot draw, write an HTML mock of that screen in `app/mocks/`, using the
   style's real tokens and component CSS from `node dev/lg.js pack <folder> --draft`, so the mock
   and the style cannot drift apart.
3. Render it with `node dev/lg.js shot` into the round's renders folder, and list it in section 8
   of `direction.md`. The critic judges the mock like any other screen.

## 10. Worked example: Stride, a training log

A made-up app, here to show the method end to end.

- **Who and when:** runners, twice: right after a run (phone, out of breath, 30 seconds) and Sunday
  evening on the Mac (planning the week, 10 minutes).
- **Content shape:** a run's splits are a rhythm, so a row of bars whose heights are pace, not a
  table; the week is seven columns of effort, not a list; effort is one filled segment of a 10-step
  bar, not "Effort: 7/10".
- **World:** the paper training diary (a week per spread, ruled columns, totals at the foot), the
  race bib (one huge number, small text around it), lane markings (thin parallel rules as the only
  ornament).
- **Thesis:** "The week is the page: every screen is laid out like a training-diary spread, with the
  run's one number as large as a race bib and everything else in small ruled type."
- **Tension:** athletic but calm. Energy goes into the bib number and the splits; everything else
  stays quiet enough to read while tired.
- **Signature:** on the run screen, the splits as a bar rhythm under the bib-sized distance. It comes
  from the run's own data.
- **Principles:** the week is the unit, never the month; one number per screen is large; data with
  a rhythm is drawn as a shape; colour means effort and nothing else.
- **Directions:** A "Diary" (paper canvas, ruled, serif numerals, the Mac week as a spread);
  B "Bib" (graphic, oversized condensed numbers, flat colour fields by effort); C "Track" (dark,
  lane-line rules, signal colours, dense).

## 11. Signatures that worked for this owner

- **Youch!:** a circle of periwinkle pixel static that shows listening, see-through, gone when not
  capturing. Born from the core action. The owner: "it looks amazing."
- **OpenText:** the full toolbar at rest that fades to title and format chip while typing. Born from
  the document being the subject. Picked over two other layouts.
- **NFELO:** the sticker-book personality the old site had: pastel tiles, ink outlines, hard offset
  shadows. Born from the owner's memory of what made it fun.
- **Signl:** the rating as one large numeral that grows. Born from the one number that matters.
