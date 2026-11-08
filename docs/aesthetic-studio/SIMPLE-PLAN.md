# Studio, simple mode (2026-11-07)

Coordinator: main session (Opus). Workers: Sonnet, two at once, disjoint files. Only the coordinator
edits this file.

## Why

The owner's first real use of the studio: deep and good for refining, but a person can't use it.
It opens on Identity asking for build class, build notes, press behaviour, icons; nearly every
control needs knowledge of the spec. And Variations freezes the page for about 2.4 s and the Kit tab
for about 1 s.

Agents never use the editor's screens: they edit the style file and run the checker. So the editor can
get a simple face for people while the file, the checker, the skill and the full panels stay exactly
as they are. Nothing an agent or a power user can do today goes away.

## Decisions

1. **Two views of one file.** The editor opens in **Simple**; **All settings** is today's panels,
   unchanged. A switch in the top bar flips between them and is remembered (localStorage). Both write
   the same spec; Simple only ever calls the same edit path, so undo, autosave and the change log work.
2. **Simple sections**, in order. Every control is a pure spec → spec function in
   `js/studio-simple.js` (node-testable), with a `read(spec)` that shows the current choice, or
   "Custom" when the file was set some other way (Simple never overwrites a custom setting unless the
   person picks a new option).
   - **Basics:** name, "What makes it yours" (the core trick, optional, with examples), looks best in
     light or dark.
   - **Paper:** swatches (white, warm white, cream, kraft, newsprint, cool grey, ink black), a custom
     colour and "Follow the brand colour". It sets one canvas recipe and removes any other canvas
     recipe, so nothing is left not in effect. The dark version is derived (same hue, deep), as done
     by hand in Seed Packet round 4.
   - **Surface:** cards: Flat print, Outline and hard shadow, Soft raised, Bold blocks, Film frame,
     and "Same as one of my styles". One click sets the kit (all 70 components' material and states)
     plus the moves those materials need, taken from the starters and Darkroom.
   - **Corners and lines:** corners Square / Slight / Rounded / Pill; lines None / Hairline / Bold /
     Heavy.
   - **Type:** headline feel and body feel as chips by font class, each drawn in a font of that class
     (fills the recommended classes and picks); labels Mono caps / Sans / Serif; headline spacing
     Tight / Normal / Loose.
   - **Touches:** a gallery of signature details (tear line, stamped label, double rule, ticker strip,
     film edge, barcode, …) with plain names and one line each; toggle on and off. A curated list of
     board moves that are safe with their defaults on any style.
   - **Art:** none, your own image or SVG, or a generated one picked by name.
   - **Words:** motto and kicker, optional.
3. **Only the name is required.** Descriptor, summary, core trick, build notes, font note, rules
   and material label are written automatically from the Simple choices while they are empty or still
   hold the text Simple wrote last time; once a person edits one in All settings it is theirs. No
   template text, no checker warning.
4. **New style dialog:** name, then starting points as picture cards (board thumbnails) instead of a
   dropdown. The core trick is optional there.
5. **Round panel:** the same rounds, worded for people: "Show me options" (Variations), "Change only"
   for the axis, "Finish this round" with the summary pre-filled. Pinned notes stay.
6. **Speed:** no single freeze over 200 ms when opening Variations or the Kit tab. Variations cards
   draw progressively; the Kit tab draws what's on screen first.

## Tasks

| ID | Owner | Writes | State |
|----|-------|--------|-------|
| S1 | Sonnet | `js/studio-simple.js` (new), `js/studio.js`, `css/studio.css`, `js/styles-home.js`, `css/styles-home.css`, `index.html` (one script tag), `tests/run.js`; decisions 1–5 and the Kit-tab half of 6 | accepted |
| P1 | Sonnet | `js/studio-round.js`, `js/studio-rounds.js` (perf only), `js/aesthetic-spec.js` (perf only); the Variations half of 6 | accepted |
| R | Sonnet | ponytail-review fixes 1–8 (kit card crops, plain round log, ink paper mode, avoid list, wording, upload label, kit observer) | accepted |
| PF2 | Sonnet | kit drawn per group: cards draw only the target group, Kit tab in chunks, leftover preview stylesheets pruned | accepted |
| V | Coordinator | first-time-person test, review, commit, desktop rebuild | accepted |

## Results

- Kit drawing was the real cost: a full kit is about 3,300 parts against about 26,000 CSS rules (0.85–1.25 s in
  the app's browser). Variation cards now draw only the group they crop to (4–116 ms); the Kit tab draws two groups
  at once and the rest in idle chunks; the studio keeps one preview stylesheet per visible preview instead of a
  dozen.
- A first-time run: New style, name only, a picture card, then paper, surface and touches by clicking. The style
  opened in Simple with its description, core trick and build notes written from the choices; the round log read
  in plain lines ("paper: custom → kraft", "surface: custom → flat print").
- Not done: the Simple view below 1200 px wide; the main app's own Built view still draws the full kit at once.
