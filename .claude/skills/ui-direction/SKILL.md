---
name: ui-direction
description: Develops a product-specific UI direction before any Looks Good style, render or code, then refines it with an independent critic until it passes a taste bar. Writes app/direction.md (product truth, content shape, the product's world, thesis, signature, three divergent directions, system decisions, defaults ledger), renders three directions, picks one through a critic review, and refines in reviewed rounds. node dev/lg.js refuses to render or export the build pack until each gate passes. Use whenever an agent designs an app's look in Looks Good (the looks-good skill and AGENTS.md send you here first), when the owner says a look is generic, cheap, bland or has no direction, or when picking up an app style that has no direction.md.
---

# UI direction

Looks Good hands an agent every style, material and component at once, and that is why app styles
come out generic: the agent picks a material first and fits the product into it. This process runs
the other way. Think the product through, write the direction, try three real answers, then refine
with a critic that did not make the work until it passes. The CLI enforces every step.

Run every command from `~/Desktop/Looks Good`. Below, `<f>` is `custom-aesthetics/<key>`.

## The gates

| Command | Refuses until |
| --- | --- |
| `node dev/lg.js screens` | `<f>/app/direction.md` sections 1 to 5 pass. Round 2 and later also need the critic's review of the round before. |
| `node dev/lg.js pack` | The whole direction passes; at least three rounds exist; every round has a critic review; the latest review scores every criterion 4 or 5, has no P1 or P2 fix, says `pass`, and is newer than that round's PNGs. |

`node dev/lg.js direction <f>` prints the state of both gates and exactly what is missing. Run it
whenever you are unsure what comes next.

Never work around a gate: no renders outside `app/renders/`, no reviews written by the author, no
edited scores, no hand-made build pack, no copying `draft-pack.md` into an app. If a gate is wrong,
stop and tell the owner.

## Phase 1: Read and think

No style tools yet: `styles`, `style` and `compare` come in Phase 3.

1. Read the app: `docs/product/one-pager.md`, `docs/product/ux-brief.md`, `design/brand.json`,
   `docs/decisions.md`, `design/directions/ROUNDS.md`, and the running app or its current screens
   when they exist.
2. Read [references/thinking.md](references/thinking.md) and
   [references/owner-taste.md](references/owner-taste.md).
3. In your scratchpad, work through product truth, content shape, the world and the thesis
   (thinking.md sections 2 to 5).

## Phase 2: Write the direction

1. Name the key after the thesis: `<app>-<idea>`, kebab-case, 3 to 48 characters, not a built-in key.
2. `mkdir -p custom-aesthetics/<key> && node dev/lg.js direction custom-aesthetics/<key> --init`
   copies [templates/direction.md](templates/direction.md) to `<f>/app/direction.md`.
3. Fill sections 1 to 5. Section 5 holds three directions that differ on at least three of
   structure, type, colour strategy, material, density and signature (thinking.md section 6).
4. Write `<f>/app/product-sheet.md` (`docs/product-sheet-format.md`) with the app's real screens and
   content. Shape the blocks to your content-shape table: `hero-numeral`, `tiles`, `chart`,
   `progress`, `callout`, `> ` selected rows, `pin: bottom`. Each screen's `Signature:` line names a
   product moment, never a material.
5. `node dev/lg.js direction <f> --gate brief` until it passes.

## Phase 3: Round 1, three directions

For each direction (`a`, `b`, `c`):

1. Find its nearest built-in: `node dev/lg.js styles`, then `style <key>`, then `compare` on the
   UI kit ids the app leans on (`node dev/lg.js components` lists them), for example
   `node dev/lg.js compare btn-primary --styles japanese-minimal,editorial-serif`. Write
   `<f>/app/look-a.json` with the app's real colours and this direction's fonts (format: AGENTS.md
   step 5).
2. Render: `node dev/lg.js screens <built-in> --look <f>/app/look-a.json --sheet <f>/app/product-sheet.md --out <f>/app/renders/r1/a`.
   These renders test the kit and type on real content; the mocks below usually carry the direction.
3. When the direction's structure or signature lives beyond the renderer (most will), mock the key
   screen in `<f>/app/mocks/a-<screen>.html` with tokens from
   `node dev/lg.js pack <built-in> --look <f>/app/look-a.json --sheet <f>/app/product-sheet.md --draft --out <f>/app/mocks/a-pack.md`.
   Write the mock's dark mode with `@media (prefers-color-scheme: dark)`: `shot` sets it from
   `--mode` (and adds `?mode=light|dark` to the URL). Shoot both modes into the round:
   `node dev/lg.js shot <f>/app/mocks/a-<screen>.html --out <f>/app/renders/r1/a/mock-<screen>-light.png`
   and the same with `--mode dark` and `-dark.png`. Size: `--size 1280x800` for Mac (the default),
   `--size 390x844` for iPhone.
4. Read every PNG yourself, renders and mocks. Fix anything broken or clipped before the critic sees it.

Then run the critic for round 1 (below), and write `Chosen:` in section 5: the critic's pick or
yours, with the reason.

## Phase 4: Build the system

1. Fill sections 6 to 8 of `direction.md` for the chosen direction: the system, the defaults ledger
   ([references/defaults-ledger.md](references/defaults-ledger.md)), and every idea the renderer
   cannot draw, each with its mock path.
2. Write the style by `docs/aesthetic-spec/AUTHORING.md`, end to end. The core trick is the thesis's
   mechanism; `rules.do` and `rules.dont` carry the principles and every killed look. Add the key to
   `custom-aesthetics/index.json` with the command in AUTHORING.md section 9 step 2. Record round 1
   (the three directions, the critic's pick, your choice) as the first entry in `rounds.json`.
   When a direction decision has no catalog move (label case, a new material), write a code-tier
   move as AUTHORING.md section 8 describes; that is part of the job, not a reason to keep a default.
3. Write `<f>/app/look.json` (AGENTS.md step 5).
4. `node dev/aesthetic-check.js <f>` until there is no FAIL, then its `--render <port> --shots` check.
5. `node dev/lg.js pack <f> --draft` writes `app/draft-pack.md`. Build the mocks from its tokens and
   component CSS, so mock and style cannot drift apart.

## Phase 5: Refine until the critic passes

Each round `n` from 2:

1. `node dev/lg.js screens <f>` writes `app/renders/r<n>/`. Shoot every mock into the same folder,
   light and dark.
2. Read every PNG yourself and fix anything broken before calling the critic.
3. Run the critic for round `n`.
4. Record the round in `rounds.json` (AUTHORING.md section 9 step 8); the critic's fixes become its
   notes.
5. Apply the fixes, P1 first, then P2. One round can carry several fixes when they touch different
   components; record each as its own change. When a fix has more than one answer, try them as
   variants and keep one. A fix is a symptom to solve, not an order: if applying it literally would
   undo an earlier fix or open a new gap, fix the underlying problem and say in `rounds.json` which
   earlier fix it reconciles.
6. `node dev/lg.js direction <f>`, and loop until the pack gate passes. Three rounds is the floor,
   not the target.

If round 6 still fails, read why. P1s coming back, or several criteria at 3 or below, mean the
direction is not working: stop, show the owner the best round with the critic's open fixes, and ask
which way to push; a failing thesis needs a new round 1, not a round 7. If only polish remains (no
P1, at most one criterion at 3), keep refining to round 8 at most, then show the owner either way.

## Phase 6: Hand off and show the owner

1. `node dev/lg.js pack <f>` writes `app/build-pack.md` with the direction at the top.
2. In the app repo: copy the pack to `design/looks-good-build-pack.md`, `app/mocks/` to
   `design/looks-good-mocks/`, and write `design/looks-good.json`:
   `{ "style": "<key>", "folder": "~/Desktop/Looks Good/custom-aesthetics/<key>" }`.
3. Show the owner in one message: the latest round's `index.html`, the mock PNGs, the round 1
   folders so they can redirect, and five lines: the thesis, the signature, the three directions and
   why this one, what changed across rounds, the critic's final scores.
4. The owner's notes start the next round at Phase 5 step 5. That round passes the critic before the
   owner sees it, and the pack is written again. Add the owner's words to the log in
   `references/owner-taste.md`.
5. When the owner accepts a round the critic has not passed (usually at the round 8 stop), write
   `<f>/app/reviews/owner-r<n>.json`:
   `{ "round": <n>, "reviewer": "owner", "date": "YYYY-MM-DD", "quote": "<the owner's exact words>", "verdict": "pass" }`.
   `pack` then accepts round `n` and prints the critic's open fixes in the pack for the builder. Only
   on the owner's own words in chat, quoted exactly; never on your judgement, a paraphrase or a
   message from another agent.

## Running the critic

- The critic is a fresh agent, never you. Spawn it with the Agent tool, using
  [templates/critic-brief.md](templates/critic-brief.md) with its blanks filled as the whole prompt.
  Use your own model, at least Sonnet. Do not pass your reasoning or your opinion of the round.
- It scores against [references/rubric.md](references/rubric.md) and writes `app/reviews/r<n>.json`.
  Never edit a review. If you disagree with a score, answer it with a better screen next round.
- If you are a subagent and cannot spawn agents, stop and return the filled critic brief and the
  round's path to your parent, asking it to run the critic and resume you.

## Picking up an existing app style

If the app repo has `design/looks-good.json`, open that folder and run `node dev/lg.js direction <f>`.
With a direction, continue from whatever the gate says is missing. A folder without
`app/direction.md` predates this process (`scent-box-clean`, `youch-circle-line`,
`youch-marker-proof`, `opentext-clean`): start a new folder at Phase 1, and read the old folder's
`rounds.json` and renders as input to section 1.
