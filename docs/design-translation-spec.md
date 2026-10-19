# Spec: from board to real app (the missing design layer)

Date: 2026-10-18. Evidence: the Signl build history (`~/Desktop/Signl/docs/brand/brand-review.md`, `docs/design/redesign-direction.md`, `redesign-plan.md`, `home-simplification.md`, decision D-014) and `docs/brief-test-findings.md` here.

## What's actually missing

A board answers "what does this brand look like?" A shipped app also needs answers to "what is each screen for, what matters most on it, and how does this style behave in a product like this one?" The brief has no layer for those questions. So the build agent either copies everything literally or invents the answers, and both have failed.

Signl shows the pattern clearly:

1. **The brief tells the agent not to think.** It opens with "Every value is final … invent nothing." The agent did exactly that: every recipe went in, none was ranked, and the result "reads like a token sheet" (redesign-plan §1). Walker rejected it.
2. **Then the fix swung too far.** D-014 says "the brief is inspiration, not a literal token spec." That needed a separate design lane, a full redesign plan, and a CPO review that cut Home from five blocks to three. The brief was no help at that point.
3. **What made the board good was never written down.** The redesign diagnosis names three things: a steep type ladder (huge numerals, tiny tracked labels), generous space, and *one* material moment (the dark glass tab bar) against plain cards. None of these are tokens. They're relationships and priorities, and the brief only carries values.
4. **Nobody had told the brief what the product is.** It didn't know Signl's hero is an 84pt arithmetic question, that Home is a launchpad, or that Play has no chrome. It filled the gap with a generic sample app (Projects / Inbox / Payments) and told the agent to match it to the point: "Build these two screens to match." For a math game, that instruction is wrong.
5. **The brief contradicts itself, and the agent has to rule on it.** Signl's brand review settled 10 conflicts in v1 and 10 more in v2: primary black on a black canvas, "no shadows" next to shadow recipes, a gradient with no colours, the band with no place in an app. Each one was a decision the agent made blind.

**In one line:** the brief carries the brand's *values* but not its *judgment* (what ranks, where the signature lands) or the *product* (which screens, which jobs). The missing piece is a design layer between brand and code.

## Problem statement

Walker designs a brand in Branding Designer and hands an AI agent the brief to build an app. Every time, the first build follows the brief and still looks bad, or it drifts away from the brand. Each product then needs a redesign round. Signl needed two rebrands and a separate design lane before Home was right. Until this is fixed, the board can't do its main job, which is directing agents that build product UIs.

## Goals

1. Walker accepts the first build of a new app's core screens without a redesign round. Signl needed at least two.
2. A brief contains zero internal contradictions. Signl's had 10 per version.
3. The agent logs at most 3 brand decisions it had to make on its own per build, and each one matches the brief's stated intent. Signl's brand reviews logged 10 or more.
4. The same board produces visibly different, correct screens for different product types (a game, a finance dashboard, a chat app), not one sample-app layout reskinned each time.

## Non-goals

- **Generating the app's code or a full design system per product.** Branding Designer briefs the agent; it doesn't replace the build.
- **Product strategy.** Deciding Signl's features or modes stays in the product repo (`v1-scope.md` and the like). The brief only reads that information.
- **More pixel fidelity.** Rounds R1–R6 already pushed kit-row measurement to 8–9/10. Measuring more precisely won't fix ranking or product fit.
- **Websites.** Landing pages already follow the hero-shows-the-product rule. This spec covers app screens.
- **Art in apps.** The app-UI-no-art rule stands. This spec gives apps a signature through components, not art.

## The fix, in three parts

### A. Split the brief into Locked, Guided and Free

Every line of the brief gets one of three labels, and the opening line stops saying "invent nothing":

| Tier | What it covers | Agent latitude |
| --- | --- | --- |
| **Locked** | Colour values and roles, type faces and weights, corner set, material recipes, contrast pairs, states | Use exactly as written. |
| **Guided** | Type ladder ratios, spacing rhythm, density, where the signature moment goes, primary-colour budget | Follow the stated intent. Values can flex within the stated range, for example a 64–84pt hero numeral. |
| **Free** | Layout, information architecture, which component fits which need, how many sections a screen has | Design it. The Screen spec (part C) sets the job, not the layout. |

### B. Add a "Why this works" section of ranked, transferable principles

For each aesthetic, write 3–5 principles in priority order, each with a "board → app" translation. Example for Mesh × Liquid Glass:

1. **One material moment per screen.** On the board it's the dark glass tab bar. In an app, glass goes only where content scrolls beneath it: tab bar, sheet, floating action plate. Everything else stays a plain card.
2. **A steep type ladder.** The board pairs a huge numeral with an 11pt tracked label. In an app, each screen gets one oversized element (its hero) and everything else stays quiet.
3. **Space over decoration.** The board uses a 36pt gap between sections and never fills a space with pattern. In an app, cut a section before you shrink the gaps.

Also add a short **"Literal traps"** list: board elements that should *not* reach an app as drawn. For example: the striated band, the swash under every headline, the numbered eyebrows on a three-block screen.

### C. Add product intake and a Screen spec

Before writing an App brief, Branding Designer asks for (or imports) a short product sheet:

- One sentence on what the app is for and the single action users come for.
- The screen list, three to eight screens. For each: its job, its one primary action, its hero element, and real sample content. "What's 15% of 340?" beats "Lorem ipsum".
- The screens that must stay chrome-free (Signl's Play, for example).

From that sheet, the brief gets a **Screen spec** per screen in place of the generic "Built screens":

- The job and the priority order of its content, ranked 1–N.
- Where this style's signature moment lands on this screen, or "none here".
- A fold budget: what must fit above the tab bar at default text size.
- Empty, loading, error and first-run versions.
- No pixel y-positions. Layout is Free. The ranking and the budget are what get checked.

The Built view renders the product's own screens with its sample content. Walker reviews those before any agent builds.

## Requirements

### P0: must ship

1. **Tiered brief.** Every brief line is tagged Locked, Guided or Free, and the header explains what each means.
   - [ ] The "invent nothing" sentence is gone. The header says Locked values are final and the layout is the agent's to design.
   - [ ] Guided values are written as a range plus their intent ("hero numeral 64–84pt: the largest thing on screen by 2× or more").
2. **Contradiction lint.** The brief generator refuses to emit a brief that contradicts itself.
   - [ ] It checks each text and fill pair for contrast in both modes. This catches primary-on-canvas in dark mode, Signl conflict #1.
   - [ ] It checks recipes against prose rules. "No shadows" next to a shadowed recipe fails.
   - [ ] It checks that every token a rule names exists and has a value, so a gradient always has its colour stops.
   - [ ] When a check fails, the board shows what's wrong before the brief can be exported.
3. **"Why this works" plus "Literal traps"** for every kept aesthetic, starting with the six Signl tested in R1–R6.
   - [ ] 3–5 ranked principles, each with a board → app translation.
   - [ ] At least 2 literal traps per aesthetic.
4. **Product intake and Screen spec.**
   - [ ] Without a product sheet, the App brief falls back to today's output and is labelled "generic sample".
   - [ ] With a sheet, each screen gets a ranked content list, a signature placement, a fold budget and four states.
   - [ ] A product sheet can be imported from a Markdown file in the product repo, so Signl's isn't retyped.
5. **Rendered comps of the product's real screens, approved before any build** (Walker's call, 2026-10-18).
   - [ ] With a product sheet, the Built view renders each listed screen from the UI kit with its real sample content, following its Screen spec.
   - [ ] Walker approves or comments per screen; the App brief can't be exported for a product until every screen is approved.
   - [ ] The brief links the approved comps as the visual target. Ranking, signature placement and fold budget are checked against them; pixel positions aren't.

### P1: fast follow

6. **Review rubric in the brief.** A short checklist the build agent and a review agent score against. Each item comes from a real rejection:
   - Does it read like a token sheet?
   - Is there more than one material moment on a screen?
   - Is any control scrunched?
   - Does the hero fit the fold budget?
   - Is there art in the app?
   - Is any text truncated?
7. **Decision log hook.** The brief asks the agent to log every brand call it made, in one fixed format. Walker can then see what the brief failed to answer.

### P2: later, but design for it now

8. Decision logs from builds feed back into the aesthetic's "Literal traps" and principles.
9. Product-type presets (game, dashboard, chat, commerce) that start the product sheet with typical screens.

## Success measures

- **Leading:** run the new brief against Signl's real screens (Home, Play, Summary, Settings) with 3 fresh agents. Target: Walker accepts 2 of 3 builds unchanged, 0 contradictions are logged, and each build logs 3 or fewer of its own calls. For comparison, the current baseline is "generic" in R1, and the Built screens were the generic sample app.
- **Leading:** run the same Mesh × Glass board against a second product type, for example a chat app. Target: screens are clearly different from Signl's and still pass the rubric.
- **Lagging:** the next new app ships with no D-014-style "brand as inspiration" reversal.

## Open questions

- **[Walker, blocking] Where does product knowledge live?** Typed into Branding Designer, or read from the product repo's docs? I lean towards importing from the repo, with a small form for anything missing.
- **Decided 2026-10-18:** Branding Designer renders comps of the real screens and Walker approves them before any agent builds (P0 #5).
- **[Design, non-blocking] Who writes "Why this works" for 35 aesthetics?** I propose writing the six tested ones first, then the rest in batches.
- **[Engineering, non-blocking] Does the lint run on export only, or live as the board changes?**

## Phasing

1. **Phase 1:** tiers, the contradiction lint, and "Why this works" for the six tested aesthetics. These are brief-only changes, with no new UI.
2. **Phase 2:** product intake, the Screen spec, and rendered comps with per-screen approval, using Signl as the first product sheet. Retest with 3 agents.
3. **Phase 3:** the rubric and the decision log. A second product type validates the work.
