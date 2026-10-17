# Refinement plan: simple, powerful, trustworthy

Session date: 2026-10-17. The owner asked how to make Branding Designer as useful as possible for themselves and other branders, refined to the point of simplicity, with no AI prompting inside the app. Fixing how faithful each aesthetic is will happen in a separate run and is out of scope here.

This follows the Oct 14 brainstorm (`docs/commercial-brainstorm.md`). That one asked how to make the app impressive, and most of its features shipped. This one asks the opposite question: what does a working brander do here every day, and what has to change, shrink or go so that work is effortless?

---

## 1. What the app is actually for

Two jobs came out of real use. Everything in the app should serve one of them.

**Job A: feel a pattern or UI, then take it away.** The owner opens the app, finds a pattern, and exports it as a desktop wallpaper, a slide background or a screenshot. Success means the file is the right size for where it's going and looks exactly like it did on screen.

**Job B: see the UI before building it, then hand it to a coding agent.** The board shows what the product will look like, and the brief tells an agent how to build it. This is what produced Weather, Actually and Some Noise, and it is the most valuable thing the app does.

The brand deck and present mode are a third, smaller job: showing a direction to someone else.

### What really happened with the two apps

A helper traced both apps through their repos and transcripts. Neither was built from one exported brief, as written:

- **Weather, Actually** (`~/Projects/Not Just a Weather App`). On 2026-10-10 the owner pasted two full exports, Neo-Brutal Pop and Raw Brutalist (about 27 KB each), in one message. The coding agent condensed them into an 89-line `docs/design/brutal-pop/BRIEF.md` and built from that. The owner dropped the Raw brief's ruler grid as wrong for a weather app.
- **Some Noise** (`~/Desktop/WhiteNoise`). Only a pasted `:root{}` CSS-variables block came from the app. The Soft Form look came from the `/soft-form-design` skill, and the palette was the owner's own suggestion.

Both times, the coding agent filled in everything the brief didn't cover:

- dark mode (the brief literally says "not designed");
- pressed states and motion;
- empty, error and loading states;
- Dynamic Type and large-text layouts;
- Reduce Motion, Reduce Transparency and Increase Contrast fallbacks;
- the app icon, which took three or more rounds in each app;
- widgets;
- the mapping from CSS to SwiftUI.

It also hit a font weight that the brief named but wasn't bundled (Sora 800), and a colour that went to the wrong job.

**Takeaway:** the board is doing its job. The brief is helping despite itself. It's long (247 to 348 lines), it's written for the web only (CSS shadows, px units, Google Fonts URLs, "load `js/patterns/` and call `Patterns.render`"), it can contradict itself (`brief-soft-form-dark.md` sets Playfair Display as the heading font, then says Soft Form wants a geometric sans and that Playfair is on its avoid list), and it's silent on most of what a real app needs. The agent's first move every time was to rewrite it shorter.

---

## 2. Principles

1. **One brand, four views.** Board (the UI), Patterns, Deck and Brief are four ways to look at the same brand. Nothing else gets its own place.
2. **Every output is ready to use.** An export lands at the right size for its destination. A brief builds on the platform you named, without the agent having to fix it first.
3. **The app resolves its own contradictions.** If the brief would say two different things, the app catches it before you copy, not the coding agent afterwards.
4. **Instant, or it doesn't ship.** Any edit shows up on screen in under 150 ms. Anything slower gets a cache or gets cut.
5. **No AI inside.** The intelligence is in deterministic rules and good defaults. The AI is downstream, in the agent that reads the brief.

---

## 3. Phase 1: make it trustworthy

This blocks daily use, so it goes first. Every item below was seen live on 2026-10-17 (browser at 1024 px, Tessel / Bento Grid) or in the owner's screenshots (Mac app, Naive Doodle / Marker botanicals).

### Speed

- **The deck is slow on purpose and then slow again.** Any edit calls `render()` → `renderBrandDeck()`. That marks the deck dirty, waits `BD_REBUILD_DELAY_MS` (400 ms), waits for an idle callback (up to 400 ms more), and then `renderBrandDeckNow()` throws away all ten slides with `innerHTML` and rebuilds them, pattern images included (`js/brand-deck.js:1081-1119`). Three timed rebuilds took 538, 167 and 1,017 ms. So an edit can take nearly two seconds to reach the deck, and the slides blank out while it happens.
  - **Fix:** cache each slide's pattern image by family + seed + parameters + inks + size. Patch slides in place instead of replacing the whole grid. Only re-render slides whose inputs changed. Keep the 400 ms delay only for continuous drags (colour pickers, sliders), and render discrete edits on the next frame.
  - **Check:** for any aesthetic switch, the deck updates in under 150 ms with a warm cache and never shows a blank slide.
- **Every view renders everything.** The Patterns view also renders the recommendations list and the whole deck below it. The page was 4,548 px tall, with 3,595 DOM nodes and 267 buttons. Each view should render only itself (see principle 1). That fixes speed and focus at the same time.

### Layout (Patterns view, from the owner's screenshots)

- At wide windows, the pattern preview and controls sit in two narrow fixed columns, with most of the window empty on the right. The preview should take the free space, because the pattern is the point.
- The family grid's thumbnails are tiny, a "+" sits over every one, and the labels are cut to four letters ("Half…", "Stip…"). Use fewer, larger tiles with full names, and show the add button on hover only.
- The "Fixed colours" segmented control overflows its box ("Primaries" spills past the edge). The rows wrap unevenly ("Toner" sits alone).
- The Brand suite row cuts its labels the same way.
- The recommendations score pill is clipped at the right edge ("4 good · 3 to").
- After an aesthetic switch, the Patterns view rendered empty for a moment before the pattern appeared.

### Chrome

- The toolbar wraps to two lines at 1024 px, and Share and Show drop below the view tabs.
- First-run tips chain one after another (Shuffle, Mix in a second style, See it built) and sit on top of the controls. One covered the view tabs. A click meant for "Got it" landed on **Shuffle everything** and rewrote the brand (undo restored it). Limit tips to one per session, never place them over the toolbar or a destructive control, and add a single "turn tips off" setting.
- On the deck's cover slide, at 1024 px the footer line appears twice and the pattern strip sits under it. Confirm this at full width and in the Mac app before fixing.

### Phase 1 done means

A fixed set of screenshots shows no clipped text, no overflowing controls and no empty columns: three window widths (1024, 1440, 1920) × the four views × five aesthetics (the owner's top favourites), checked in WebKit through the Mac app. Edit-to-screen time stays under 150 ms on every view. The existing `tests/` pass.

---

## 4. Phase 2: a brief that builds (the highest-value change)

This comes right after Phase 1. It is the job that produced two shipped apps.

### What the brief should tell the agent, and what it shouldn't

**Add a target setting next to "Copy AI brief": Web, SwiftUI or Both.** This is a plain picker, not a prompt. It changes the units and code in the brief:

- **SwiftUI:** a `Theme.swift`-style token block (Color, Font with the bundled weights, radius, spacing and shadow as SwiftUI modifiers), Dynamic Type sizes, and the asset names to bundle.
- **Web:** CSS variables, as today.

**Cover what every app needed and the brief never said.** Each item below is filled in by deterministic rules from the aesthetic's metadata. None of it is generated.

- Light *and* dark: either both palettes, or an explicit "this aesthetic is dark-only, here's why".
- States: pressed, disabled, focus, empty, loading and error, each with its colour role and motion.
- Motion: durations, the easing, the press effect (for example the Weather "squish": 4 pt offset, moves 4,4), and what happens when Reduce Motion is on.
- Accessibility: contrast pairs (already present), Increase Contrast and Reduce Transparency fallbacks for glass and soft aesthetics, and the minimum hit size.
- Icons: stroke weight, corner style and fill rule, matched to the aesthetic.
- App icon: a one-paragraph recipe (background, mark, material) in the aesthetic. Both apps lost several rounds here.
- Font files: the exact weights to bundle. This is where Sora 800 broke.

**Cut what isn't actionable.** Drop the instruction to "load `js/patterns/` and call `Patterns.render`", which no outside project can follow. Ship pattern exports as asset files instead (see Phase 3). Remove the duplicated prose across "Where each color goes", "Component color map" and "Hard rules". **Target: under 120 lines**, about the size the agent condensed it to on its own.

**Resolve before copy.** When the brief would contradict itself (heading font on the aesthetic's avoid list, accent used for two jobs, a weight that isn't bundled), Copy shows the conflict with a one-click fix for each. It never exports a contradiction.

**Directions in, one brief out.** The owner pasted two briefs and let the agent merge them. The app already has Blend. Make "take the type from A and the materials from B" the way you build one direction before export, so the merge happens where you can see it.

### What "done" means

Rebuild one Weather, Actually screen and one Some Noise screen from a fresh export in a clean session, with no hand-written spec. Count the number of times the agent has to invent something (dark mode, states, icon, font weights). Today that number is high. The goal is close to zero, and the agent shouldn't rewrite the brief before starting.

---

## 5. Phase 3: a pattern studio that exports for real places

This is the everyday job, and most of it is file sizes and framing.

- **Export by destination, not by multiplier.** Replace PNG 1x / 2x / 4K with named targets:
  - Mac desktop (this screen's native pixel size, read through the Mac bridge);
  - iPhone wallpaper;
  - slide 16:9 (1920×1080 and 3840×2160);
  - Keynote and PowerPoint background;
  - square and 4:5 social;
  - seamless tile (SVG and PNG).
  
  Keep a "Custom…" option for anything else.
- **Quiet zone for slides.** A toggle that calms or fades the pattern behind a title-safe area. The owner uses these as slide backgrounds, and a busy pattern under text is the usual failure.
- **Preview where it's going.** The "In use" strip (card, phone, poster) is the right idea at the wrong size. Let the main preview switch between the actual frames: desktop, phone lock screen, a 16:9 slide with a dummy title. One frame at a time, full width.
- **Set the wallpaper from the Mac app.** One button, using `NSWorkspace.setDesktopImage`. It's the most common use and the fewest steps.
- **Pattern files in the brief.** When patterns are in the brief, the Copy action also saves the tile files next to it (or zips them), so the coding agent gets assets instead of engine instructions.

---

## 6. Phase 4: subtract

Do this after the phases above, when it's clear what's still used.

- **Four views and two menus.** The views are Board, Patterns, Deck and Brief. The two menus are Share (every export) and Show (present and reveal). Compare and Worlds become modes within Board ("this brand across styles"), not separate destinations.
- **Showcase becomes the default.** Classic/Current and the recommendations panel move behind a developer flag. The recommendations' content folds into the brief's "Resolve before copy" step, where it can change an outcome instead of being read.
- **A shortcut for everything.** Add a command palette (search for actions by name, not a prompt) and one key for each view. Mastery should feel like speed.
- **Remove internal vocabulary from the UI:** donor, channels, brief cart, suite preset.

---

## 7. What the app should tell people

The question behind this plan is "what information are we giving people?" Here is the answer, view by view:

- **Board:** what the product will look like, light and dark, with real states (pressed, empty, error). Nothing about how it was made.
- **Patterns:** the pattern at the size and in the frame where it will be used, plus the one or two controls that matter for that family. Advanced parameters stay folded.
- **Deck:** the direction, told in ten slides, for someone who isn't the brander.
- **Brief:** only what an agent can act on, for the platform it's building, with no contradictions. The brief is a contract, not a description.

---

## 8. Close

**Strongest direction:** Phase 1 plus Phase 2. A tool that is instant and that produces a brief an agent can build from without a rewrite is already the masterful version of this product. The pattern studio and the subtraction pass make it pleasant. Phase 1 and Phase 2 make it trustworthy.

**Riskiest assumption:** that a deterministic brief can cover states, motion, dark mode and the app icon well enough across 35 aesthetics without hand-writing each one. If the aesthetic metadata is too thin, Phase 2 turns into 35 hand-written sections. Test this before building: write the new sections by hand for two aesthetics (Neo-Brutal Pop and Soft Form, the two that shipped) and run the rebuild test in section 4. If those two land, generalise the rules. If they don't, the gap is in the metadata, and it belongs with the aesthetic-fidelity run.

**Suggested order:** Phase 1 → the two-aesthetic brief test → Phase 2 → Phase 3 → Phase 4.

**Parked:** website import, logo-start colour extraction, the mini-site export and the self-running demo loop. These are all impressive, but none of them serves Job A or Job B.

**Separate run, owner's call:** faithfulness of each aesthetic. Phase 2 depends on it for the metadata that drives states and motion. Phase 1 and Phase 3 don't.
