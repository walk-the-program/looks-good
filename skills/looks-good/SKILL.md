---
name: looks-good
description: Designs an app's look through Looks Good, a local style tool (the folder holding AGENTS.md, ~/Desktop/Looks Good by default), by command line instead of clicking. Develops a written direction first, tries three directions, then builds a one-off in-depth style for the app and refines it in rounds reviewed by an independent critic until it passes a taste bar; renders the app's own iPhone or Mac screens as PNGs and exports the build pack only once the gates pass. Also inspects how every style draws every UI kit component (values, motion timing, real CSS). Use when the user says "use Looks Good", "design the look for this app in Looks Good", "make a style for this app", "render our screens in a style", "how does this style draw a button", or points an agent at Looks Good from another app repo.
---

# Looks Good from another repo

Find Looks Good: the folder in the `LOOKS_GOOD_DIR` environment variable, else `~/Desktop/Looks Good`,
else ask the user once for the folder that holds `AGENTS.md`. Below, `<LG>` is that folder.

1. Read `<LG>/AGENTS.md` in full. It is the source of truth for commands, the one-off style folder,
   `look.json` and the round loop. Follow it, not this file, when they differ.
2. Designing a look for an app means following `<LG>/.claude/skills/ui-direction/SKILL.md` from
   Phase 1: think the product through and write `app/direction.md` before any style JSON, render or
   code. `lg.js screens` and `lg.js pack` refuse to run until its gates pass. Only a quick question
   ("how does soft-form draw a button?") skips it.
3. Run every `node dev/lg.js …` and `node dev/aesthetic-check.js …` command with `<LG>` as the working
   directory (`cd "<LG>" && node dev/lg.js styles`).
4. Write the style and the app's files only under `custom-aesthetics/<key>/` in Looks Good, and list
   the key in `custom-aesthetics/index.json` so it shows in Looks Good's styles, labelled
   "Built for <app>" from `app/look.json`; once the user accepts it, take the app's previous style out
   of that list (AGENTS.md step 4). In the app's own repo, write only the copied build pack
   (`design/looks-good-build-pack.md`, create `design/` if missing), the copied mocks
   (`design/looks-good-mocks/`) and a pointer `design/looks-good.json`:
   `{ "style": "<key>", "folder": "<LG>/custom-aesthetics/<key>" }`.
5. The user sees a round only after a fresh critic agent has passed it. As a subagent that cannot
   spawn the critic, return the filled critic brief and the round's path to your parent instead.

When another skill called you (an app pipeline's look step, for example), hand back to it once a round
passes; it shows the user the round and locks the look.

If `design/looks-good.json` already exists in the app repo, run `node dev/lg.js direction <folder>` on
that folder and continue from what the gate says is missing. A folder without `app/direction.md`
predates the direction process: start a new folder at ui-direction Phase 1, using the old folder's
`rounds.json` and renders as input.
