# Move audit: findings (2026-11-06)

**Verdict: the framework holds.** Three very different styles, rebuilt from generic moves only,
came out at roughly 85–90% of the original. What a moves-only rebuild loses is concentrated in one
place, the signature art, not spread across the system. Colour, material, type and the UI kit
transfer almost completely.

Plan and task ledger: [PLAN.md](PLAN.md). Library: [move-library.md](move-library.md). Side-by-side
pairs: open [compare.html](compare.html) from the running app's server
(`http://localhost:<port>/docs/move-audit/compare.html`).

## 1. The audit

- All 45 current styles were audited from their JS and CSS: core trick, colour recipe, moves,
  and the remainder that only bespoke code does, with file:line evidence (`parts/A–I.json`).
- 511 raw moves under 389 names merged into **198 moves**: 190 a studio could pick, plus 8
  framework helpers built into the engine (contrast fitting, mode variants, seeded randomness…).
- Reuse is real: **51 moves are used by 5 or more styles**, 60 by 2–4, 79 by one.
- Tiers of the 190 pickable moves: 16 token, 108 recipe (parameterised CSS), 45 generator (code
  written once, reused by params), **21 bespoke**. Almost every "needs code" item the auditors
  found turned out to be a generator, not bespoke: colour solvers, headline treatments and
  procedural art can all be written once and driven by params.
- Worker estimates of how much of each style its moves carry ranged from 40% (ASCII Art, Xerox
  Punk, Blob Tracking) to 85% (Soft Form, Editorial Serif, Raw Brutalist), mean 65%. The low end
  is the styles whose look *is* a drawing machine.
- Kit styling fits one model: **materials + a component map** (which material and which
  press/hover/selected behaviour each component gets). It covered every component the audits
  met. Soft Form's ~190 per-component rules collapse into about a dozen materials and states.

## 2. The rebuild test

Each rebuild is a pure-data spec (`dev/move-lab/specs/*.js`) plus generic moves
(`js/moves/*.js`) that never mention the style they came from. It loads only with
`?movelab=1`; the normal app is unchanged (45 styles, clean console, tests pass). Pairs were shot
in one headless session with identical brand colours and fonts.

Scores are my reading of the screenshots, not the workers' self-estimates.

| Surface | Soft Form | Acid Graphics | Editorial Serif |
|---|---|---|---|
| Board hero | 70: headline, kicker, highlight exact; hero art slot empty | 85: headline warp, outline echo, strips exact; flyer replaced by a generic op-art ripple | 92: masthead, double rule, duotone plate with cropped initial; plate captions gone |
| Palette | 98 | 97 | 98 |
| Type section | 95 | 98 | 95 |
| Interface / touch cards | 85: slider row missing (injected markup) | 95 | 95: pull quote gone |
| Kit components | 85 | 88 | 85 |
| **Overall** | **~85** | **~87** | **~90** |

What was lost, in order of how much you notice it:

1. **Signature art.** Soft Form's disc-and-glass scene, Acid's 4:5 flyer with sponsor marks,
   Editorial's plate captions. These are the single-style art the library classes as bespoke.
2. **Kit components outside the map.** Lightbox controls, top-bar title, stepper, FAB, calendar,
   knob dial. The map has 28 components; the kit has more. Adding them is mechanical.
3. **Injected markup.** Soft Form's board slider comes from a panel hook, not CSS.
4. **Small literals.** Pull-quote text, "Fig." captions, per-section strip copy.

Rule compliance: zero style names in the move files; zero lines copied from the original CSS,
except one: `js/moves/soft.js` hard-codes the original's iridescent rim gradient where it should
take the colours as params.

## 3. What this means for the product

- **Moves carry the system; art carries the signature.** A studio composing from moves gets a
  coherent, working aesthetic, board and kit included. What it will not get for free is a hero
  image as distinctive as the built-ins.
- **The art slot should take the studio's own artwork.** Studios have art. Let the hero slot
  accept their own SVG or image, alongside the generator moves (op-art ripple, duotone plate and
  skyline bars all proved generic here). That closes the biggest gap without a code tier.
- **The code tier still matters**, but for agents and developers only: a move file is ordinary
  code against a documented contract. Every rebuild worker wrote one without touching the app.
- **Agents can already use this.** Each rebuild was done by an agent reading the README, writing a
  spec and moves, shooting, looking and fixing in up to three rounds. That is the agent path the
  framework needs, working today in prototype.

## 4. Framework gaps found

Fixed during the test:
- A spec can now carry `meta` (font recommendations) and `build`, so the Type section renders
  and fonts follow the style.
- Moves receive the brand state in `tokens()`.
- `corner-radius` no longer forces switches, progress and avatars round.
- `shoot.sh` pins brand colours and fonts across a pair (`LG_PIN=1`) and shoots the deck cover.

Still open (the spec v2 list):
1. Expand `KIT_COMPONENTS` to every kit class (today 28).
2. Let a material target the board or the kit separately (Soft Form worked around it).
3. A shared token bus, so one move can use a colour another computed (Acid used a workaround).
4. Per-mode values (light vs dark tuning) as data.
5. Material and state names are global; a duplicate silently overwrites.
6. Merge the duplicate moves (`focus-ring--soft`, `focus-ring--acid`, `kit-cell-frame--*`,
   `section-number-marker--acid`) into their shared versions.
7. An image/SVG art slot in the spec (point 3 above).
8. `soft.js`: take the rim gradient colours as params.

## 5. Next step

Write spec v2 (the gap list above) and the checker (`dev/aesthetic-check`: validate a spec,
contrast and stress tests, closest built-in style, screenshots). Together they are the complete
agent path. The studio UI, with its round loop and Variations button, then edits the same file.
