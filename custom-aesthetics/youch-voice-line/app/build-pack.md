# Youch! build pack

## Direction (read before building)

### 1. Product truth

- Who and when: Walker, all day at a MacBook Pro, dictating about 99% of what he writes (long think-out-loud prompts into Claude and Dia, short replies in Slack and Mail). The dictation itself happens outside the window: hold Right Command, talk, let go, and the text is pasted where he was typing. The window is opened a few times a day for 10 to 60 seconds: to copy a dictation whose paste missed, to check what was removed, to teach a name ("Pramand", not "prominent"), to glance at Insights, or for a few minutes to read a meeting transcript with speakers.
- The moment that matters: two moments, one product promise. Outside the window, the instant the listening circle appears and, after release, the ring that fills until the paste. Inside the window, the proof that Youch! "never rewrites what you said": the kept text next to what was actually said, with removed fillers struck, spoken corrections marked and anything it learned named.
- Should feel: in Walker's words, "clean, sleek, modern ... classed up, kind of minimalist, kind of Bauhaus ... a little neo-brutal pop ... a slight bit of character, but also very, very proficient"; later "a little bit more modern, slightly more character". Calm, quick motion, never playful or bouncy (D-042).
- Must never feel: a colour highlight band behind a title or word (killed in round 4); a lollipop chart (replaced by an area graph); a live transcript window or anything popping up while dictating; frosted or milky glass; a SaaS dashboard of equal stat tiles; "simple" done as empty grey boxes; stock red for errors (errors are ink with an icon); board art, patterns or textures on app screens; a phone column stretched across a Mac window.
- Owner notes so far: Round 2 (2026-11-08): "For the history, I would keep it with option B" (Mail-style two-pane). Round 3: the listening circle of periwinkle static with the white made clear, "it looks amazing", and "it should disappear when it's not capturing". Round 4 (Looks Good, 2026-11-14): "a little bit more modern, slightly more character. I dont love the color highlighting". Round 5: "run with the circle and line one, and then I would just change this to an area graph", locked as Circle & Line (D-037): 1.5px ink-line pills and circles, periwinkle fills what is chosen, flat hairline cards at radius 20, Outfit 600 display with Inter text, butter at most once per screen as a small solid circle, Insights as a flat area graph. Motion (D-042): "having no animations is kind of chunky. We want it to be a little bit more premium." Rewording dial is Off / Low / High (D-038); the Structure key is gone (D-040). Earlier Looks Good folders for this app (youch-marker-proof, youch-circle-line) showed the renderer's limits: the Mac sidebar, list wrapper and selected row cannot be restyled, and a butter band under the title read as the killed highlight.

### 2. Content shape

| Object | What it really is | Drawn as | Not as |
| --- | --- | --- | --- |
| A dictation | a stretch of voice that became text: it starts when the key goes down and lasts as long as Walker talked | a periwinkle dot (the moment he started talking) and an ink line whose length is how long he talked, beside the first line of the kept text | a row of equal cards with "312 words · 2 min" as the only sign of size |
| What you said vs. what was kept | a faithful record with a small, visible set of edits: fillers removed, a spoken correction applied, a word learned | the kept text set large for reading; under it the said text with removals struck, corrections marked with a periwinkle caret, and learned words named in a margin note | two equal grey boxes, or the said text hidden behind a tab |
| A dictionary term | a name Youch! must spell right, plus the ways it was misheard and the voice clips that taught it | the right spelling set as a display word; misheard forms struck beside it; clips as a row of up to five discs, filled for each recorded clip | a table row "Pramand / prominent, promand / 3 of 5" |
| Words over time (Insights) | one number that matters (words this week) and its rhythm by day | one numeral set very large, the week as a flat area under a single ink line | four equal stat tiles or a lollipop chart |
| A recording | a conversation: speakers taking turns over 38 minutes | each speaker a disc with their initial; the transcript as turns hung on a left rule with tabular time codes; a thin speaker strip showing who held the floor when | a chat-bubble list, or speakers as chips |
| Cleanup and Rewording | two dials with real stops (Light / Medium / Heavy; Off / Low / High) | a straight track with stops, the chosen stop filled | dropdowns, or a toggle list |
| The dictation key | a physical key on the keyboard | a keycap drawn with its legend, the chosen one filled | a select menu reading "Right Command" |
| Listening and finishing (overlay) | voice being captured, then text being made from it | the clear circle of periwinkle static while talking; after release a thin ring that closes around it as progress | a waveform, a live transcript, or a spinner |

### 3. The world

| Artifact | Mechanism to take | Where it lands in the UI |
| --- | --- | --- |
| A proofreader's marked-up galley | the original stays readable; every change is a small mark in the line (strike, caret) with its reason in the margin | History reader: "What you said" with struck fillers, a caret for a spoken correction and a margin note for what was learned |
| A court stenographer's transcript | a fixed left gutter carries the speaker and the time code, so the text column stays clean and every line can be traced back | Recordings transcript: speaker disc and time code in a gutter, the words in one reading column |
| A tape counter on a recorder | elapsed time as a precise, tabular numeral, the one number you read while the tape runs | audio players and durations: tabular minutes and seconds, never "2 min" in prose where precision helps |
| A Bauhaus poster (Moholy-Nagy, Bayer) | a strict grammar of basic forms on an asymmetric grid, with one form carrying the meaning and huge type set flush left | the whole app: circle for voice, line for text, display type flush left at real scale, asymmetric two-pane layout |
| A broadcast "on air" lamp | one light that is lit only while live, and dark otherwise | the listening circle: present only while capturing; the sidebar's "hold to talk" is quiet until then |

Software precedents:
- Wispr Flow: keep the small floating indicator and a history of every dictation; break its hidden rewriting by showing the said text and every edit next to what was pasted.
- Apple Mail / Notes: keep the two-pane list and reader Walker chose; break the identical grey rows by giving every dictation its length.
- Descript: keep the idea that the transcript is the recording (struck words are removed audio); break its crowded editor chrome.

### 4. Thesis

Thesis: Voice is round, text is straight: anything spoken (listening, a dictation's start, an audio clip, a speaker) is a periwinkle disc, anything written sits as ink on a straight line, so every screen reads as voice turning into text, while the chrome steps back to bare rules and white space.
Tension: character but proficiency: character goes into the voice discs, the dictation length lines and the display type; proficiency goes into the lists, settings and transcripts, which stay dense, aligned and tabular.
Signature: the talk line, on History: every dictation is a periwinkle dot where Walker started talking and an ink line as long as he talked. It comes from the core action (hold, talk, let go), it reappears as the speaker turns in Recordings and the clip discs in Dictionary, and after release it closes into the ring in the overlay.
Principles:
1. Periwinkle means voice. Only spoken things are periwinkle (listening, audio, clips, speakers, the mark); selection and the main action are drawn in ink.
2. Round means spoken, straight means written. Discs and rings are reserved for voice; controls and text containers are straight-edged.
3. What you said always sits next to what was kept. No dictation hides its edits behind a tab or a second click.
4. Butter means learned. The one spark on a screen marks something Youch! learned, never decoration and never a band behind text.
5. One number per screen is large; every other number is small and tabular.

### 5. Directions

#### A. Proof
- Thesis: History as a printer's proof: the kept text set like a page for reading, the said text beneath it marked up, and every change explained in a margin.
- Structure: the Mail-style two-pane window Walker chose: a 240 sidebar, a 340 list, the reader with a 200 margin column on its right for notes (corrections, learned words, cleanup level). Medium density.
- Type: Outfit 600 display (the locked voice), Newsreader for the kept text, because a proof is a printed page and a serif reads as the finished article; Inter for the UI and the said text.
- Colour: brand-led, as today: periwinkle fills the selected nav item, the chosen segment and the main action; voice discs periwinkle; butter for the learned note.
- Material: Circle & Line kept: 1.5px ink-line pills, flat hairline cards at radius 20, no shadow.
- Signature: the proof margin: each struck filler, spoken correction and learned word has a matching note in the reader's right margin.

#### B. Steno
- Thesis: Every screen is a transcript: time codes and names in a fixed left gutter, words in one clean column, ruled like a stenographer's page.
- Structure: three columns without cards: the sidebar, a dense ledger list (time, app, length line, words in tabular columns), and a reader whose text runs beside a gutter of time codes. High density, everything on rules.
- Type: IBM Plex Sans throughout with tabular numerals and Plex's own weights for the column heads; a transcript is a working document, so one sober family with a clear scale.
- Colour: tonal: ink and greys do all the work; periwinkle appears only on voice (discs, the play head), butter only on a learned word.
- Material: ruled paper: hairline rules between rows, square corners (radius 4), no cards, no fills except the selected row's ink edge.
- Signature: the time-code gutter: every paragraph of a dictation and every turn of a recording carries the moment it was said, so the text can be played from any line.

#### C. Score
- Thesis: The day as a score: dictations are drawn as dots and lines on a time axis, like notes on a stave, and the rest of the window is set in big flush-left Bauhaus type.
- Structure: History opens with a full-width strip, "today" as a time axis from 8 AM to now with each dictation a dot and a length line; below it the list and reader. Sparse, bold, few elements per screen; Insights is one huge numeral over one area.
- Type: Space Grotesk 700 display set very large and tight, with Inter for text: a grotesk with geometric quirks gives the Bauhaus poster its voice and the "slight bit of character".
- Colour: voice-led: periwinkle only on voice, ink for every control and selection (solid ink fills with canvas text, the neo-brutal pop), butter as the learned spark.
- Material: square-edged controls (radius 6) drawn with a 2px ink line; circles only for voice; flat planes with no shadows and no cards around lists.
- Signature: the day score at the top of History: the rhythm of a talking day at a glance, long prompts as long lines, quick replies as short ones.

Chosen: C + B ("Voice Line"). The round 1 critic and the author agree: C is the only direction whose mock argues the thesis, with a signature born from the core action (the day score and a talk line in every row), and it answers "more modern, slightly more character". From B it takes the time-code gutter beside the said text and the Recordings transcript, and B's discipline: no cards, groups made by rules and space. C's display face goes back to the locked Outfit (critic f8; the vendored Outfit has 400 and 600, so display is Outfit 600); Space Grotesk is offered to the owner as a named alternative. Everything else wrong with C lived in the bauhaus-poster kit (art shapes, stripes, periwinkle fills, caps), which the custom style drops.

### 6. System

#### Layout
The real 1180x780 window: a 196px sidebar closed by a 2px ink rule (navigation is used every visit, so it is always one click away), then the page. Page titles sit flush left at the content edge (30px inside the rule) on a 2px ink rule that runs the page width. History, Recordings and Dictionary are two-pane: a 360px list column and the reader, split by a 1px hairline; Mail-style, as Walker chose. History adds the day score between title and panes: today on an 8 AM to now axis, so the gaps show the rhythm of the day. Density: medium in lists (58 to 64px rows), sparse in the reader. The main action lives in the reader's header row at the trailing edge (Copy ⌘C), never as a slab in the content; secondary actions sit beside it or in the footer next to the audio.

#### Type
Outfit 600 for display (locked in D-037): page titles 56px, tracking -0.045em, leading 0.92; reader titles 28px; list names 16px; the Insights numeral 132px. Inter for everything else: kept text 21px / 1.5 (the dictation is the content, so it reads like a page), body 14px / 1.45, said text 15px / 1.75, meta and time codes 12.5px. Tabular figures on every number, time and duration. One small role for tracked capitals: section labels (TODAY, YESTERDAY, KEPT, SAID) in Inter 600 11px, 0.08em; nothing else is in capitals.

#### Colour
Meaning-led: periwinkle means voice, ink means text and action, butter means learned. The palette roles say it too: primary is ink #101116 (the main action, selection and focus own it), secondary is periwinkle #8290C7 (voice owns it), accent is butter. Canvas #FAFAF7 and ink #101116 carry 95% of every screen. Periwinkle #8290C7 (3 to 5%) is only on spoken things: each dictation's start dot, play heads, voice clips, speaker discs, the listening circle and the mark. The selected item and the main action are solid ink with canvas text, so selection reads without colour. Butter #F6CF6B appears at most once per screen as a 10px disc beside something Youch! learned, never behind text. The Insights area is the flat secondary tint #DDE1F2. Dark mode is designed, not inverted: canvas #101116, ink #FAFAF7, rules #333438; selection and the main action become cream fills with dark text; periwinkle stays #8290C7 because voice is content and keeps its colour; the area becomes a 26% periwinkle mix on the canvas so it stays a quiet plane.

#### Material and shape
Doing: straight-edged controls with 6px corners and a 2px ink line (secondary buttons, keycaps); fields are a square 1px hairline at rest (the ink at 50% in light, 31% in dark, about 3:1 in both) that turns ink on focus and becomes a 2px ink frame on error (cream in dark), so the three states read without colour; segmented controls are plain options with the chosen one filled ink and no outer track; switches are a square ink slug on a 1px ink track. The main action and the selected state are solid ink. Holding: no cards. The page is one plane; groups are made by space and rules: a 2px ink rule under titles and down the sidebar edge, 1px hairlines between rows and around the panes. Radius family: 6 on controls, 0 on planes, full round only for voice (discs, the overlay backing, the progress ring). No shadows, gradients, blur or glass anywhere.

#### Motion
Press: controls move 1px down in 80 ms, no colour change. Select: the ink fill slides to the new row or segment in 180 ms, ease-move cubic-bezier(0.4,0,0.2,1); the reader crossfades 120 ms out, 180 ms in. Signature: when a new dictation lands, its dot appears and its line draws left to right in 240 ms, ease-out, in the list and in the day score; in the overlay, the ring closes with real progress around the held static. Reduce Motion: only a 120 ms opacity fade. Calm and quick (D-042), never springy.

#### Words
The product's own words: "What you said", "Kept", "Said", "Learned: Preman → Pramand", "Hold ⌘ to talk", "Copy", "Copy what you said", "Fix a word", "Clips", "Who spoke". Sentence case everywhere. Empty History: "Hold Right Command and say something. It lands here, with what you said underneath." Empty Dictionary: "Names you say often go here. Add one and record it three times." Empty Insights: "Talk for a few days and your patterns show up here." Empty Recordings: "Drop a meeting or interview here. It never leaves this Mac."

#### Craft
One strong left edge per pane (30px inside a rule); the gutter (52px) carries time codes right-aligned to a 16px gap before the text. Spacing steps 4, 8, 12, 16, 24, 32, 48; gaps inside a group are at most half the gap between groups. Selected rows are solid ink in both modes; in menus and pickers, where a check glyph marks the choice, the chosen option is set bold with an ink rule instead, so the glyph stays visible. Spoken corrections in What you said carry a small periwinkle caret, never an underline, because underlines mean actions. Focus is a 2px ink outline 2px out. Icons only where they add meaning (play, search); 1.75px strokes on a 20px grid. Every talk line uses one scale (3px per second, capped at 120px) so lengths compare across rows.

### 7. Defaults ledger

| Reflex | Decision | Why, for this product |
| --- | --- | --- |
| One neutral sans for everything (Inter, DM Sans, Geist, Manrope, SF) | change | Outfit 600 carries every title at poster scale (the locked display face); Inter is kept only for text and numbers, where exactness matters. |
| Tracked uppercase micro-labels above values | change | Values explain themselves ("1:52 PM · 0:24"); tracked caps are kept for one role, the section labels in lists and the gutter. |
| Every group in a card, all cards the same fill and radius | change | No cards: the page is one plane grouped by rules and space, like a transcript page. |
| Radius 12 to 20 on everything | change | 6px on controls, 0 on planes, full round only for voice, so roundness means spoken. |
| Off-white canvas, near-black ink, one muted accent | keep | Youch!'s own neutrals; the colour is periwinkle for voice and butter for learned, each with one job, so the chrome can stay quiet. |
| Full-width pill primary button inside the content | change | The main action is a compact ink "Copy ⌘C" in the reader's header row, where a Mac toolbar action lives. |
| An icon on a button that adds no meaning | change | Buttons are text only; the ⌘C hint replaces an icon because it says something the label does not. |
| Numbers in stat tiles | change | Insights sets one numeral large over one area graph; the other figures run as one line of small tabular text. |
| Ratings as text glyphs | keep | Youch! has no ratings; the nearest thing, clips recorded, is drawn as five discs. |
| A Mac window drawn as one centred column | change | Sidebar, list and reader across the full 1180px; Insights uses the width for the graph. |
| Grey tint as the selected state | change | Solid ink with canvas text (cream in dark), readable without colour. |
| A hairline under every row | keep | A transcript is ruled paper; rules group the list and replace cards. They are deliberate: 1px hairlines between rows, 2px ink under titles. |
| Soft blurred drop shadow | change | None anywhere; depth is never needed on a flat page. |
| Chips for every tag | change | App names and styles are plain text with a middle dot; the only marks are the voice dot and the learned disc. |
| Section headers as one plain word | change | Headers use the product's words ("What you said", "Who spoke", "Learned from your fixes"); the list's day labels stay single words because a date needs no more. |
| Empty state as "No X yet" plus a button | change | Each empty state says what to do in Walker's terms and what the screen becomes (section 6, Words). |

### 8. Beyond the renderer

| Idea | Why it matters | Mock |
| --- | --- | --- |
| The talk line and the day score: each dictation a periwinkle dot and an ink line as long as Walker talked, on an 8 AM to now axis | the signature; the renderer's chord draws a stacked tint bar, and a code-tier move is off-limits for this job (AGENTS.md: style agents never edit js/ or index.html) | mocks/history.html |
| The real two-pane window: 196px sidebar with ink selection, list and reader, the reader's time-code gutter and Copy in the header | the renderer's Mac sidebar, list wrapper and selected row cannot be restyled, and it centres one column | mocks/history.html |
| Copy ⌘C as a compact ink button in the reader's header row, with Copy what you said beside the audio | the renderer draws every main action as a full-width slab with its label set left and centres secondary labels; no catalog move changes button label alignment, and code-tier moves are off-limits for this job, so the sheet shows secondary actions as links | mocks/history.html |
| Clip discs: five discs per term, filled for each clip recorded, misheard forms struck beside the right spelling | the Dictionary's own content shape; the renderer has no disc row | mocks/dictionary.html |
| The flat area graph under one ink line, with the week's numeral at 132px and the other figures as one tabular line | the renderer's chart is a sparkline and its stats are tiles | mocks/insights.html |
| The Recordings transcript on a speaker gutter, with the "who spoke" strip in speaker discs | turns, speakers and time codes need a gutter the renderer does not draw | mocks/recordings.html |
| The dictation key as keycaps with legends, Cleanup and Rewording as stop tracks | the renderer draws segmented text controls | mocks/settings.html |
| Welcome as a flush-left poster with the brand mark at scale and the keyboard row, the hold key filled in ink with a voice dot | the renderer centres a phone-like column and has no keycap | mocks/welcome.html |
| Try it with the focused practice box and the download line in the footer | the renderer has no onboarding footer bar | mocks/try-it.html |
| The listening overlay: a round dark backing with the clear periwinkle static. Not adopted: the owner keeps today's overlay (2026-11-16) | the overlay is not a window the renderer draws | mocks/overlay-pill.html |
| The finishing overlay: the static held still and a cream ring closing around it with real progress. Not adopted: the owner keeps today's listening pill and progress ring (D-025, D-028, D-035) | same | mocks/overlay-ring.html |

Latest critic review: app/reviews/r8.json (verdict refine)

Owner sign-off: round 8, "obviously, keep the overlay in there, but I would switch to Voice Line for the product."

Open critic fixes the owner accepted:
- f1 (P2, kit: text field focus in dark (kit-dark.png)): Applying r7 f1 raised the dark rest line to #5C5D5E, which closed the gap the last three reviews relied on ('still below the #858687 focus frame'): focus is now a 1px #858687 line beside a 1px #5C5D5E rest line, about 1.8:1 at the same weight, while kit-light.png draws focus as a 2px ink frame. Note n34 and section 6 say focus is the cream border; it is not. Keep the rest line at about 3:1 (r7 f1) and make the dark focus border the 2px cream #FAFAF7 frame r4 f1 asked for, through a {light,dark} param on the field material, so both fixes hold.

Everything an AI coding agent needs to rebuild the Youch! app UI in the Voice Line style for Web (HTML and CSS): the brief, the design tokens, the real code that draws the UI kit and screens and the logo, with a prompt at the top that says how to use it. Generated by Looks Good.

## Contents

1. [Part 0: How to use this file (prompt for the agent)](#part-0-how-to-use-this-file-prompt-for-the-agent)
2. [Part 1: Brand brief](#part-1-brand-brief)
3. [Part 2: Design tokens](#part-2-design-tokens)
4. [Part 3: UI kit source](#part-3-ui-kit-source)
5. [Part 4: Screen layouts](#part-4-screen-layouts)
6. [Part 5: Patterns](#part-5-patterns)
7. [Part 6: Logo](#part-6-logo)
8. [Part 7: Verification checklist](#part-7-verification-checklist)

## Part 0: How to use this file (prompt for the agent)

This section is addressed to you, the AI coding agent. Read it first and follow it exactly. It tells you what this file is, which part wins when two disagree, what to do in what order, and what to report when you finish.

**What this file is.** The build pack for Youch!: App UI, Voice Line style, for Web (HTML and CSS). It holds the brand brief (Part 1), the design tokens (Part 2), the real CSS and reference markup that draw every UI kit component (Part 3) and every screen layout (Part 4), the logo (Part 6) and a checklist you must pass (Part 7). Everything you need is here; do not redraw anything from memory and do not invent values this file does not give.

**Authority order.** When two things in this file disagree, the earlier one wins:

1. Part 1 brief rules: what is allowed, where, and why.
2. Part 2 tokens: the only colours, type faces and spacing values you may use.
3. Part 3 component CSS values (`kit.css`): every colour, size, radius, border, shadow and type setting of every component.
4. Part 3 and Part 4 reference markup: illustrative. It shows structure and intent; class names are Looks Good's own, and the demo copy ("Brand refresh", "Maya Ortiz") is placeholder text.

**Steps.**

1. Save this file in the project root as `BUILD-PACK.md`, and read Part 1 completely before writing code.
2. Create the token file from Part 2 (`tokens.css`: CSS custom properties, light and dark) in the project's stack (plain CSS, Tailwind theme, CSS modules). Keep the token names; every colour in the project comes from them.
3. Build each UI kit component from Part 3 by porting the `kit.css` values exactly into the project's styling system. You may rename the Looks Good class names (`ab-*`, `sb-k-*`, `sb-*`) to the project's own conventions, but keep every value: colours, sizes, radii, borders, shadows, type, spacing and every state (rest, pressed, focus, disabled, open and so on). The selectors are scoped to the kit root described in Part 3; keep the same scoping or fold it into your own. The custom properties `kit.css` reads are resolved in Part 2.
4. Assemble screens from Part 4: each layout names its blocks in order, its rules, and gives the reference markup of the phone screen. Spacing, the 44pt tap target and the type scale come from Part 1 and do not change per screen.
5. Patterns are out of scope for this build: it is an App, and app screens carry no patterns or art.
6. Place the logo from Part 6 at the sizes and positions Part 1 gives.
7. Finish with the Part 7 checklist: go through every item, fix what fails, and do not call the work done until all of it passes.

**Hard rules** (they repeat Part 1 on purpose).

- No colour outside the tokens. No gradient, opacity or tint that is not derived from them as Part 1 says.
- No art and no patterns in app UI: app screens are built from the UI kit only.
- The demo copy in the reference markup ("Brand refresh", "Maya Ortiz" and the like) is placeholder: replace it with the product's real text, but keep the structure and length discipline.
- Keep the 44pt minimum tap target and the phone type scale (sizes, line heights, weights) exactly as Part 1 gives them.
- Match both light and dark exactly as the tokens define them; the dark palette is designed, not inverted.

**Report back** when you finish: (1) the files you created or changed; (2) which Part 7 items pass, and for any that do not, why; (3) every place you could not match a Part 3 value or a Part 1 rule, and what you used instead; (4) any placeholder copy you left in.

## Part 1: Brand brief

The full AI brief for this brand, unchanged apart from its headings being one step deeper. It holds the rules: colours and where each is used, type, shape, states, motion, accessibility and what is allowed where. Where anything in this file conflicts with it, the brief wins.

### Youch! — build brief
Build the real product from this brief, not a mock-up. Sections are marked Locked, Guided or Free. Locked values are final: use only these colors, fonts, shapes and motion, and where one is missing use the nearest listed token. Guided sections give an intent and a range; stay inside them. Free means design it for this product: layout, screen structure and how many sections a screen has. Screens are composed from the UI kit below, one component for each need; do not invent new component styles, and do not copy the brand board's layout. Target: a phone app in HTML and CSS, laid out in iOS points (1pt = 1 CSS px).
Youch!: Simple things, done well. Aesthetic: Voice Line (Spoken · Ruled · Exact; Bauhaus posters (Bayer, Moholy-Nagy) / court stenographer's transcripts / tape counters / Swiss ledgers). A plain ruled interface where only spoken things are round and periwinkle, and everything written sits as ink on a straight line. Say it. Keep it straight.
Product: Youch!. Turns what Walker says into clean text wherever he types, fully on this Mac, and never rewrites what he said.

#### App UI rules (Guided)
Build every screen from the UI kit only. The brand shows up through colour, type, corners, edges, shadow and how each component is drawn. Never put the board's hero illustration, deck art, patterns, textures, decorative bands or header art into app screens. The logo appears at icon size in the top bar or on the welcome screen, nowhere else. Images appear only when they are content (a user photo, a product photo). Never introduce a colour that is not in the palette: destructive and status colours come from it too.
The brand board, deck and landing page show art for the brand's identity and marketing; none of it belongs in the app.
Screens are composed from the UI kit and the phone layout below: pick the component for the need, set text in the type scale, and leave the rest to the tokens.
Focus rings appear on keyboard focus only (`:focus-visible` on the web, the system focus on SwiftUI), never on tap or click; disabled controls take no focus and no press response.

##### How Voice Line shows up in the app
- Corners: buttons 6pt, fields square, cards square, badges pill.
- Surfaces: card unfilled; list rows unfilled; bottom sheet --canvas with a 2pt solid --ink edge.
- Type: welcome title Outfit (display) 600, tracking -0.04em; section labels Inter (body) 400; button labels Inter (body) 600.
- Primary and selection: the primary button is --ink with a --canvas label; the selected segment is --ink; the selected tab shows a 16x3pt --primary pill, near the bottom of the box, centred.
- Signature details: toggle: a 16pt --ink square, vertically centred in the box, at the left; pie menu: a 152pt --ink at 3% dot with a 1pt solid --line edge, near the top of the box, at the left; skeleton screen: a a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line) sheet covering the whole box.

#### Colors (Locked)
| Token | Light | Dark | Job | On (text and icons on it) |
| --- | --- | --- | --- | --- |
| `--canvas` | `#fafaf7` | `#101116` | The screen background. | `--ink` #101116 / #fafaf7 |
| `--ink` | `#101116` | `#fafaf7` | Default text and icons. | none |
| `--muted` | `#6e6e70` | `#9c9d9d` | Secondary text from the palette. In the UI kit: not drawn by any component. `--ab-muted` is Voice Line's own muted colour for the components its row lists; use each only where stated. | none |
| `--line` | `#d7d7d5` | `#333438` | Hairlines, dividers, resting input borders. | none |
| `--primary` | `#101116` | `#101116` | Main action. In the UI kit: Text field (focus); Search field (focus); List rows (pressed); Tab bar (selected); Tabs (selected); Combo box (open); Knob (arc); Date picker (focus); Navigation bar (selected); Navigation menu (row, selected); Drawer menu (selected); Anchor links (selected); Contextual menu (target); Expandable menu (selected); Ribbon (selected); Pie menu (hub). | `--on-primary` #ffffff |
| `--secondary` | `#8290c7` | `#8290c7` | Support. In the UI kit: List rows, Avatar. | `--on-secondary` #141414 |
| `--error` | `#101116` | `#fafaf7` | Errors and destructive actions; never a stock red. In the UI kit: drawn as `--ink` (the same value here) wherever a kit row shows an error or destructive state. | `--on-error` #fafaf7 / #101116 |
| `--kit-primary` | `#46464a` | `#fafaf7` | Measured from the UI kit in light and dark. Drawn by: Primary button, screens. | none |
| `--kit-secondary` | `#46464a` | `#b6b7b6` | Measured from the UI kit in light and dark. Drawn by: Secondary button, Text field, Search field, Checkbox, Toggle, List rows, Tab bar, Tabs, Empty state, Link, Icon, Input stepper, Knob, Date picker, Calendar picker, Wheel picker, Wheel-style date picker, Accordion, 2D matrix, Navigation bar, Anchor links, Spinner, screens. | none |
| `--kit-field` | `rgba(16, 17, 22, 0.5)` | `rgba(250, 250, 247, 0.31)` | Measured from the UI kit in light and dark. Drawn by: Text field, Search field, Select, Callout, Progress, Combo box, Date picker. | none |
| `--kit-field-2` | `#c62f2f` | `#ff7b72` | Measured from the UI kit in light and dark. Drawn by: Text field. | none |
| `--white` | `#ffffff` | `#ffffff` | Pure white, where the UI kit draws it. Drawn by: Checkbox, Radio. | none |
| `--ab-muted` | `#5b5b5e` | `#9c9d9d` | A colour of Voice Line's UI kit. Drawn by: Segmented control, Divider and section label, 2D matrix, Anchor links, Megamenu, Ribbon, screens. | none |
| `--success-icon` | `#717dac` | `#8290c7` | Success callout icon, 3:1 on its tint. Drawn by: Callout. | none |
| `--primary-text` | `#101116` | `#858687` | The primary as text and small icons (text buttons, tinted icons), shaded to 4.5:1 on the canvas. Drawn by: Link, Carousel, Breadcrumbs, screens. | none |
| `--black` | `#000000` | `#000000` | Pure black, where the UI kit draws it. Drawn by: Dialog, Side sheet, Drawer menu. | none |
| `--kit-progress-text` | `#7c7c7f` | `#fafaf7` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-stepper-text` | `#3b3a38` | `#807f7e` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
| `--kit-spinner-text` | `#7e7e80` | `#6d6e6d` | Text of this component, kept at 4.5:1 on its fill in both modes. Drawn by: kit details. | none |
Where this aesthetic's colour rules and a component description disagree, the colour rules win.
Palette colours no app component draws (brand board and app icon only; they stay in `:root`): `--accent` #f6cf6b, `--accent-ink` #101116 / #f6cf6b, `--pri-tint` #dededc / #101116, `--sec-tint` #e7e9ef / #222532, `--kit-stepper` #3b3a38.
- Primary budget: `--primary` appears only where the UI kit draws it (Text field, Search field, List rows, Tab bar, Tabs, Combo box, Knob, Date picker, Navigation bar, Navigation menu, Drawer menu, Anchor links, Contextual menu, Expandable menu, Ribbon, Pie menu), never as extra fills, text or rules. Selection, toggles, tabs and focus are drawn as their kit rows say, not in extra primary.
- Highlight word: no highlight in this style; use the brand's tagline unchanged as the welcome title (never reword it), every word looking the same.
- Text colours are the ones each UI kit row states; no other colours, tints or gradients on text.

#### UI kit (Locked)
Measured from the UI kit tab as Voice Line draws it. Every control and container in the product is one of these components, drawn exactly as stated. Colours are tokens from Colors (a plain hex or rgba() is a fixed value the kit draws); "`--x` at N%" means `color-mix(in srgb, var(--x) N%, transparent)` and "at N% over `--canvas`" means `color-mix(in srgb, var(--x) N%, var(--canvas))`; sizes are points at the 390 x 844 reference (1pt = 1 CSS px); padding is CSS shorthand; exact shadow values are the `--shadow-*` tokens; (display) and (body) name the brand faces. "Other states" lists only what changes from the first state.

##### Actions
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primary button | The one main action on a screen. | --ink | --canvas, Inter (body) 17pt 600 | no edge; 6pt corners | 52pt high, padding 0 16pt | label: --canvas, Inter (body) 17pt 600 | pressed: transform shifted 2,2pt · focus: outline 2 solid --ink offset 2 · disabled: text --kit-primary, a --canvas at 58% veil over the whole control; label text --kit-primary |
| Secondary button | The alternative next to a primary button. | none | --ink, Inter (body) 17pt 600 | 2pt solid --ink; 6pt corners | 52pt high, padding 0 16pt | none | pressed: transform shifted 2,2pt · focus: outline 2 solid --ink offset 2 · disabled: text --kit-secondary, a --canvas at 58% veil over the whole control |
| Text button | Low-emphasis actions: Skip, Cancel, See all. | none | --ink, Inter (body) 14pt 600 | bottom 2pt solid --ink; square corners | 44pt high, padding 4pt 0 | none | pressed: transform shifted 2,2pt |
| Destructive button | Delete, remove, sign out. | none | --ink, Inter (body) 17pt 600 | 2pt solid --ink; 6pt corners | 52pt high, padding 0 20pt | none | pressed: fill --ink at 8%, transform shifted 2,2pt |
| Icon button | A single icon action in a top bar or row. | none | --ink, Inter (body) 13pt 600 | 2pt solid --ink; 6pt corners | 44x44pt | none | pressed: transform shifted 2,2pt |
| Split button | A default action plus a menu of related ones on an attached chevron. | --ink | --canvas, Inter (body) 17pt 600 | no edge; corners 6pt 0 0 6pt (clockwise from top-left) | 52pt high, padding 0 16pt | caret: fill --ink, corners 0 6pt 6pt 0 (clockwise from top-left) | open: menu appears: fill --canvas, edge 2pt solid --ink, square corners; its text and marks follow the same colour |
| Floating button | The screen's main create action, floating above scrolling content. | --ink | --canvas, Inter (body) 13.5pt 600 | no edge; 6pt corners | 56x56pt | none | pressed: transform shifted 2,2pt |
| Link | Text that goes to another page or opens a resource. | none | --primary-text, Inter (body) 15pt 400, underlined | no edge; square corners | fits its content | none | pressed: text --kit-secondary · focus: outline 2 solid --ink offset 2 |
| Icon | One line-icon set at fixed sizes, always paired with a label or an accessible name. | none | --ink, Inter (body) 12pt 400 | no edge; square corners | fits its content | label: --kit-secondary, Inter (body) 12pt 400 | one state |

##### Inputs
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Text field | Single-line entry with a label above it. | none | --ink, Inter (body) 17pt 400 | 1pt solid --line; square corners; a 1pt --kit-field inner ring | 48pt high, padding 0 15pt | label: --ink, Inter (body) 13pt 400; message: --kit-secondary, Inter (body) 13pt 400 | focus: edge 1pt solid --ink, a 3pt --primary at 24% ring outside the edge · error: edge 2pt solid --kit-field-2, a 3pt --ink at 18% ring outside the edge; message text --ink · disabled: opacity 0.5 |
| Search field | Search with a leading icon. | none | --ink, Inter (body) 17pt 400 | no edge; square corners | 48pt high | input: edge 1pt solid --line, a 1pt --kit-field inner ring | focus: input edge 1pt solid --ink, a 3pt --primary at 24% ring outside the edge |
| Select | Pick one value from a list. | none | --ink, Inter (body) 17pt 400 | 1pt solid --line; square corners; a 1pt --kit-field inner ring | 48pt high, padding 0 15pt | label: --ink, Inter (body) 13pt 400 | open: menu appears: fill --canvas, edge 2pt solid --ink, square corners; its text and marks follow the same colour |
| Combo box | Type a value or pick one of the suggestions that match. | none | --ink, Inter (body) 17pt 400 | 1pt solid --line; square corners; a 1pt --kit-field inner ring | 48pt high, padding 0 15pt | label: --ink, Inter (body) 13pt 400 | open: edge 1pt solid --ink, a 3pt --primary at 24% ring outside the edge; its text and marks follow the same colour |
| Listbox | A visible list of options; pick one or several without opening anything. | --canvas | --ink, Inter (body) 14pt 400 | 2pt solid --ink; square corners | fits its content | chosen option: --ink, Inter (body) 17pt 600, edge top 1pt solid --ink at 16% | multiple: box appears: fill --ink, edge 2pt solid --ink, 6pt corners |
| Checkbox | Multi-select options. | --canvas | --ink, Inter (body) 17pt 400 | 2pt solid --ink; 6pt corners | 24x24pt | none | on: fill --ink, text --canvas, a 12x6pt block drawn as bottom 2pt solid --white, left 2pt solid --white strokes, after the text, rotated -45° · disabled: fill --ink, text --canvas, opacity 0.5, a 12x6pt block drawn as bottom 2pt solid --white, left 2pt solid --white strokes, after the text, rotated -45°; its text and marks follow the same colour |
| Radio | Single choice from a short list. | --canvas | --ink, Inter (body) 17pt 400 | 2pt solid --ink; circle | 24x24pt | none | on: fill --ink, text --canvas, a 10pt --white dot, after the text |
| Toggle | An on/off setting that applies at once. | none | --ink, Inter (body) 17pt 400 | no edge; square corners; a 1pt --ink inner ring | 40x24pt | knob: off — at the left; on — at the right; any tag beside it keeps at least 6pt from the knob; a 16pt --ink square, vertically centred in the box, at the left | on: fill --ink, text --canvas, a 16pt --canvas square, vertically centred in the box, at the right · disabled: fill --ink, text --canvas, opacity 0.5, a 16pt --canvas square, vertically centred in the box, at the right; label text --kit-secondary |
| Segmented control | Switch between 2 to 4 views of the same content. | none | --canvas, Inter (body) 15pt 600 | no edge; 12pt corners | 54pt high, padding 5pt | selected: fill --ink; unselected: --ab-muted, Inter (body) 15pt 400, 44pt high | one state |
| Input stepper | Raise or lower a small whole number one step at a time. | none | --kit-stepper-text, Geist Mono (mono) 17pt 600 | 2pt solid --ink; square corners | 48pt high | button: edge 2pt solid --ink, 6pt corners | minimum: button text --kit-secondary, a --canvas at 58% veil over the whole control |
| Slider | A value on a continuous range. | track 4pt high, 2pt corners | --ink, Inter (body) 15pt 400 | no edge; square corners | 44pt hit area | thumb: 28x28pt, round, a soft shadow | one state |
| Knob | A value on a range, turned like a dial: audio and other media controls. | none | --ink, Inter (body) 14pt 400 | no edge; square corners | fits its content | arc: fill a soft conic sweep of --primary and --ink at 16%, circle; dial: fill --ink, circle, rotated 40.5°; indicator: fill --ink, pill; value: --kit-secondary, Inter (body) 15pt 400 | one state |

##### Pickers
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Date picker | A date shown in a field; tapping it opens the calendar or wheels. | none | --ink, Inter (body) 17pt 400 | 1pt solid --line; square corners; a 1pt --kit-field inner ring | 48pt high, padding 0 46pt 0 15pt | label: --ink, Inter (body) 13pt 400 | focus: edge 1pt solid --ink, a 3pt --primary at 24% ring outside the edge |
| Calendar picker | A month grid for choosing a day or a range of days. | none | --canvas, Inter (body) 15pt 600 | no edge; square corners | fits its content | title: --ink, Inter (body) 17pt 600; weekday label: --kit-secondary, Inter (body) 12pt 600, 28pt high; day: --ink, Inter (body) 15pt 400, 44pt high; selected day: fill --ink; today: --ink, Inter (body) 15pt 400, 44pt high; outside day: --kit-secondary, Inter (body) 15pt 400, 44pt high | range: range day appears:  |
| Wheel picker | Spinning columns of values with the choice in a centre band. | none | --ink, Inter (body) 22pt 600 | no edge; square corners | fits its content | band: fill --ink at 8%, 6pt corners; value: --kit-secondary, Inter (body) 15pt 400 | one state |
| Wheel-style date picker | Month, day and year as three wheels. | none | --ink, Inter (body) 22pt 600 | no edge; square corners | fits its content | band: fill --ink at 8%, 6pt corners; value: --kit-secondary, Inter (body) 15pt 400 | one state |

##### Containers
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Card | A boxed group of related content and its action. | none | --ink, Outfit (display) 22pt 600, tracking -0.02em | no edge; square corners | fits its content | none | one state |
| List rows | Grouped rows: label, value, chevron or control. | none | --ink, Inter (body) 17pt 500 | no edge; square corners | fits its content | grouping: an open list on the canvas, rows separated by a 1pt solid --line rule; a 1pt solid --line rule closes the list; row: edge top 1pt solid --ink at 16%, bottom 1pt solid --line, 60pt high, padding 8pt 0; detail: --kit-secondary, Inter (body) 13pt 400; trailing value: --kit-secondary, Inter (body) 15pt 400; row avatar: fill --secondary, circle, 32pt high | pressed: row fill --primary at 12% |
| Accordion | Stacked headings that each open to show their section. | none | --ink, Inter (body) 17pt 500 | no edge; square corners | fits its content | heading: edge top 1pt solid --ink at 16%, bottom 1pt solid --line | open: looks the same |
| Carousel | A row of cards that swipes sideways, one page at a time. | none | --ink, Outfit (display) 22pt 600, tracking -0.02em | no edge; square corners | padding 20pt 0 0 0 | placeholder: fill --ink at 8% over --canvas; page dot: fill --ink at 30% over --canvas, circle, 8pt high; current dot: fill --primary-text, circle, 8pt high | one state |
| 2D matrix | Rows of tiles: scroll down through rows, sideways within a row. | --ink at 8% over --canvas | --kit-secondary, Inter (body) 15pt 400 | no edge; square corners | fits its content | caption label: --ink, Inter (body) 15pt 400; row label: --ab-muted, Inter (body) 13pt 400, 18pt high | one state |
| Callout | An inline message: info, success, warning, error. | none | --ink, Inter (body) 16pt 600 | top 2pt solid --ink, bottom 1pt solid --kit-field; square corners | padding 14pt 0 | none | success: edge top 2pt solid --success-icon, bottom 1pt solid --kit-field; icon text --success-icon · warning: looks the same · error: looks the same |
| Divider and section label | Separates and names groups of content. | none | --ab-muted, Inter (body) 13pt 400 | no edge; square corners | fits its content | rule: fill --line | one state |

##### Overlays
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Overlay | The dimmed layer behind anything modal; tapping it closes non-critical overlays. | --ink | --canvas, Inter (body) 14pt 400 | no edge; square corners | fits its content | note: fill --ink | one state |
| Dialog | A centred box that stops the task for a decision or a warning. | --canvas | --ink, Outfit (display) 22pt 600, tracking -0.02em | 2pt solid --ink; square corners | padding 20pt 0 0 0 | scrim: fill --ink at 6% over --canvas, 6pt corners; scrim: a --black at 38% sheet covering the whole box | one state |
| Bottom sheet | A task or set of choices that slides up from the bottom. | --canvas | --ink, Outfit (display) 22pt 600, tracking -0.02em | 2pt solid --ink; square corners | padding 10pt 20pt 20pt 20pt | grabber: fill --line, pill, 5pt high | one state |
| Side sheet | Supporting content or filters that slide in from the side edge. | none | --ink, Outfit (display) 22pt 600, tracking -0.02em | no edge; square corners | fits its content | scrim: fill --ink at 6% over --canvas, 6pt corners; scrim: a --black at 38% sheet covering the whole box | one state |
| Popup | A small panel attached to the control that opened it. | none | --ink, Outfit (display) 17pt 600, tracking -0.02em | no edge; square corners | padding 20pt 0 0 0 | trailing mark at the end of the label: nothing | one state |
| Popup tip | A one-time hint pointing at a feature, with a way to dismiss it. | none | --ink, Outfit (display) 17pt 600, tracking -0.02em | no edge; square corners | padding 20pt 0 0 0 | trailing mark at the end of the label: nothing; action: --ink, Inter (body) 14pt 600, edge bottom 2pt solid --ink | one state |
| Tooltip | A short label for a control, shown on hover, focus or long press. | --ink | --canvas, Inter (body) 13pt 400 | no edge; square corners | padding 6pt 10pt | trailing mark at the end of the label: a 14pt chip filled --ink, holding nothing | one state |
| Lightbox | One image enlarged over a dark layer, with close and next. | --ink | --canvas, Inter (body) 13pt 400 | no edge; 6pt corners | padding 56pt 56pt 48pt 56pt | image: fill --ink at 86% over --canvas | one state |

##### Navigation
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Top bar | Screen title, back and one or two icon actions. | --canvas | --ink, Inter (body) 15pt 600 | no edge; square corners | 44pt high | none | one state |
| Tab bar | 3 to 5 top-level destinations at the bottom of a phone. | --canvas | per tab, as the tab bar row lists | no edge; square corners | 83pt high on a screen, including the 34pt home indicator area | selected tab: --ink, Inter (body) 10pt 600, 47pt high; selected tab: a 16x3pt --primary pill, near the bottom of the box, centred; unselected tab: --kit-secondary, Inter (body) 10pt 500, 47pt high | one state |
| Tabs | In-page sections under a title. | none | --canvas, Inter (body) 15pt 600 | bottom 1pt solid --line; square corners | 45pt high | selected: fill --ink; selected: a 69x2pt --primary bar, straddling the bottom edge of the box, centred; unselected: --kit-secondary, Inter (body) 15pt 400, 44pt high | one state |
| Navigation menu | A vertical list of destinations with the current one marked. | none | --ink, Inter (body) 14pt 400 | no edge; square corners | fits its content | row: fill --primary at 12%, 52pt high, padding 8pt 16pt; selected row: fill --primary at 12%, --ink, Inter (body) 17pt 400, 52pt high, padding 8pt 16pt; title: --ink, Inter (body) 17pt 500; icon tile: fill --ink at 4% over --canvas, 6pt corners, 32pt high | one state |
| Drawer menu | Navigation hidden behind a menu button, sliding in from the side. | --canvas | --ink, Inter (body) 14pt 400 | 2pt solid --ink; square corners | padding 12pt 8pt | scrim: fill --ink at 6% over --canvas, 6pt corners; scrim: a --black at 38% sheet covering the whole box; selected row: fill --primary at 12%, --ink, Inter (body) 17pt 400, 52pt high, padding 8pt 16pt; row: 52pt high, padding 8pt 16pt | one state |
| Scrollbar | Shows where you are in content that scrolls, and drags it. | --line | --ink, Inter (body) 14pt 400 | no edge; pill | fits its content | thumb: fill --ink at 45%, pill, 71pt high | one state |

##### Menus
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Dropdown menu | A button that opens a list of commands. | none | --ink, Inter (body) 17pt 600 | 2pt solid --ink; 6pt corners | padding 0 16pt | none | open: menu appears: fill --canvas, edge 2pt solid --ink, square corners; its text and marks follow the same colour |
| Contextual menu | Actions for one item, on long press or right click. | --canvas | --ink, Inter (body) 14pt 400 | 2pt solid --ink; square corners | fits its content | chosen option: --ink, Inter (body) 17pt 600, edge top 1pt solid --ink at 16%; target row: fill --primary at 12%, edge top 1pt solid --ink at 16%, bottom 1pt solid --line, 60pt high, padding 8pt 16pt | one state |
| Submenu | A menu item that opens a second list of its own. | --canvas | --ink, Inter (body) 14pt 400 | 2pt solid --ink; square corners | fits its content | open item: edge top 1pt solid --ink at 16%, 44pt high; submenu: fill --canvas, edge 2pt solid --ink | one state |
| Expandable menu | Navigation items that open in place to show their children. | none | --ink, Inter (body) 14pt 400 | no edge; square corners | fits its content | parent row: 52pt high, padding 8pt 0; selected row: fill --primary at 12%, --ink, Inter (body) 17pt 400, 52pt high, padding 8pt 16pt 8pt 62pt; child row: 52pt high, padding 8pt 16pt 8pt 62pt | one state |
| Pie menu | Up to 6 actions in a ring around the press point. | --canvas | --ink, Inter (body) 14pt 400 | 2pt solid --ink; square corners | fits its content | a 152pt --ink at 3% dot with a 1pt solid --line edge, near the top of the box, at the left; hub: fill --primary, circle, 14pt high; item: fill --canvas, edge 2pt solid --ink, 6pt corners, 44pt high, shifted 2,2pt; chosen item: fill --canvas, --ink, Inter (body) 13pt 600, edge 2pt solid --ink, 6pt corners, 44pt high, shifted 2,2pt | one state |

##### Feedback
| Element | Use | Fill | Text | Edge, corners, shadow | Size | Parts and marks | Other states |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Badge and tag | Status, counts and categories. | none | --ink, Inter (body) 11pt 600 | 1pt solid --line; pill | 23pt high, padding 2pt 9pt | count: fill --ink, --canvas, Inter (body) 12pt 600, 22pt high | accent: fill --ink, text --canvas, edge no edge; dot appears: fill --ink, circle |
| Progress | A bar for known progress. | --kit-field | --kit-progress-text, Inter (body) 14pt 400 | no edge; square corners | 2pt high | fill: fill --ink, 2pt high | one state |
| Spinner | Unknown wait under a few seconds. | --ink | --kit-spinner-text, Inter (body) 15pt 400 | no edge; circle | 28x28pt | none | one state |
| Skeleton screen | Blocks in the shape of the coming layout while content loads. | --line | --ink, Inter (body) 14pt 400 | no edge; square corners | fits its content | a a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line) sheet covering the whole box; avatar: fill --line, circle; avatar: a a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line) sheet covering the whole box; line: fill --line, 6pt corners; line: a a smooth fade of --canvas at 55% at 90° to transparent (a soft gloss, no hard line) sheet covering the whole box | one state |
| Toast | A brief confirmation that disappears by itself. | --ink | --canvas, Inter (body) 15pt 400 | no edge; square corners | 52pt high, padding 0 6pt 0 16pt | action: --canvas, Inter (body) 15pt 600, underlined | one state |
| Empty state | What to do when there is nothing here yet. | --ink at 4% over --canvas | --ink, Outfit (display) 22pt 600, tracking -0.02em | no edge; circle | fits its content | message: --kit-secondary, Inter (body) 15pt 400; button: edge 2pt solid --ink, 6pt corners | one state |
| Avatar | A person or account: photo or initials. | --secondary | --on-secondary, Inter (body) 13pt 600, uppercase | no edge; circle | 32x32pt | none | one state |

#### Product screens (Guided)
These are Youch!'s own screens, from its product sheet. What gets checked is the content ranking (1 is the most important), where the style's signature lands, and the fold budget; the layout itself is designed for the product from the kit's components, with no pixel positions given. Comps of these screens are viewable in Looks Good only.
Platform: Mac. Each screen is a Mac app window, 1280x800 (comps are 2560x1600 at 2x); content taller than the window is drawn in full with a fold line at 800.

##### History
- Job: Find a dictation in seconds, copy it again, and see exactly what was kept from what was said.
- Primary action: Copy
- Chrome: Sidebar source list (History, Dictionary, Insights, Recordings, Settings), History selected
- Content, ranked:
  1. Title-size line "Can you look at the Pramand proposal and tighten the second section? Keep the pricing table as is, but the timeline should be six weeks.".
  2. Body line "~~um so~~ can you look at the ~~prominent~~ Pramand proposal and ~~like~~ tighten the second section keep the pricing table as is but the timeline should be ~~eight weeks oh actually~~ six weeks".
  3. Body line "Learned: Preman → Pramand. Youch! spells it that way from now on.".
  4. Text link "Undo".
  5. The one primary button "Copy", with "⌘C".
  6. Text link "Copy what you said".
  7. List group "Today" with 6 rows: "> Claude" (1:52 PM); "Mail" (11:05 AM); "Slack" (10:30 AM); "Claude" (9:41 AM); "Terminal" (8:55 AM); "Notes" (8:10 AM), in the sidebar column.
  8. List group "This dictation" with 5 rows: "App" (Claude); "Cleanup" (Light); "Rewording" (Off); "Release to paste" (0.33 s); "Length" (25 words · 0:24), in the inspector column.
- Signature placement: the talk line: each dictation's start dot and a line as long as Walker talked.
- Fold budget: the selected dictation's kept text, What you said, the Learned line and Copy sit above the fold.
- States:
  - Empty: First run, nothing dictated yet. "Hold Right Command and say something. It lands here, with what you said underneath."
  - Loading: none; history is on this Mac.
  - Error: none.
  - First run: the practice dictation from onboarding is the first row.

##### Dictionary
- Job: Teach Youch! the names Walker says, and see what it has learned from his fixes.
- Primary action: Add
- Chrome: Sidebar source list (History, Dictionary, Insights, Recordings, Settings), Dictionary selected
- Content, ranked:
  1. Input field "Add a name or term", placeholder "Pramand, Zelcor, Priya Raman".
  2. The one primary button "Add".
  3. List group "Terms" with 3 rows: "> Pramand" (~~prominent~~ ~~pro mand~~ · heard as promand, 3 of 5 clips); "Zelcor" (~~sell core~~ · heard as zelkor, 1 of 5 clips); "Priya Raman" (no clips yet, Record).
  4. callout "Record yourself saying a term 3 to 5 times, 4 seconds at most each. Everyday words like "prominent" are never swapped on their own.".
  5. List group "Learned from your fixes" with 1 row: "~~Zelcore~~ → Zelcor" (Nov 15, Remove), in the inspector column.
  6. List group "Snippets" with 3 rows: ""my address"" (123 Main St · 1 more line); ""my signature"" (Best, · 2 more lines); ""thumbs up"" (Sounds good, thanks!), in the inspector column.
- Signature placement: the clip discs: up to five voice clips per term, filled for each one recorded.
- Fold budget: the field, Pramand with its clips, and the Learned list fit above the fold.
- States:
  - Empty: "Names you say often go here. Add one and record it three times."
  - Loading: none.
  - Error: a clip that is too quiet: "Didn't catch that. Try again a little closer."
  - First run: Pramand from onboarding is the first term.

##### Insights
- Job: Show how Walker thinks out loud this week, in one number and one shape.
- Primary action: none on this screen
- Chrome: Sidebar source list (History, Dictionary, Insights, Recordings, Settings), Insights selected
- Content, ranked:
  1. Hero numeral "7,719", labelled "Words, last 7 days".
  2. Muted caption "51 minutes of talking across 40 dictations.".
  3. Segmented control "Range" with options "7 days", "30 days", "All", "7 days" selected.
  4. Body line "Release to paste 0.44 s · Lost threads 17 · Streak 3 days · Typing saved ≈ 2.4 h".
  5. Muted caption "Lost threads happen mostly in dictations over 3 minutes, around 9 AM.".
  6. Card ""and then the second thing is, um, what was the second thing"", with "Yesterday, 4:20 PM · Notes".
- Signature placement: none (the area graph is the screen's one shape).
- Fold budget: the words numeral, the week's figures and the lost-thread moment sit above the fold; the area graph is in mocks/insights.html.
- States:
  - Empty: "Talk for a few days and your patterns show up here."
  - Loading: none.
  - Error: none.
  - First run: the week's numeral with one dictation.

##### Recordings
- Job: Read a meeting as who said what, and name the speakers once.
- Primary action: Export
- Chrome: Sidebar source list (History, Dictionary, Insights, Recordings, Settings), Recordings selected
- Content, ranked:
  1. Title-size line "Weekly sync, launch week".
  2. Muted caption "Today at 5:05 PM · 38:00 · 4 speakers · zoom_0.m4a".
  3. Colour chord "Who spoke": one bar split by weight into You (14, #8290c7), Sarah (11, #6e79a7), Speaker 3 (9, #596287), Speaker 4 (4, #474e6b); labels inside each segment, or as a key under the bar when one does not fit.
  4. List group "Transcript" with 4 rows: "You" (Thanks for joining. Let's start with the launch checklist., 0:04); "Sarah" (The store listing is ready. I still need the final screenshots from design., 0:20); "You" (Dev, can you get those to her by Friday?, 0:42); "Speaker 3" (Yes. I'll export them tonight and send the folder in the morning., 0:49).
  5. Muted caption "Speaker 3 sounds like Dev. Not set until you say so.".
  6. Text link "Yes, it's Dev".
  7. The one primary button "Export", with "Text, subtitles or Markdown".
  8. List group "Today" with 2 rows: "Northwind call" (7:53 PM); "> Weekly sync" (5:05 PM), in the sidebar column.
  9. progress "Northwind call", in the sidebar column.
- Signature placement: the speaker discs and the strip of who held the floor.
- Fold budget: the title, speakers and the first four turns sit above the fold.
- States:
  - Empty: "Drop a meeting or interview here. It never leaves this Mac."
  - Loading: a recording being transcribed shows its percentage in the list.
  - Error: "Couldn't read this file. Try an audio or video file."
  - First run: the drop zone and Watch a folder.

##### Settings
- Job: Set the key, the two dials and the basics, then get out.
- Primary action: none on this screen
- Chrome: Sidebar source list (History, Dictionary, Insights, Recordings, Settings), Settings selected
- Content, ranked:
  1. Segmented control "Dictation key (hold to talk)" with options "Fn", "Right Option", "Right Command", "Right Command" selected.
  2. Segmented control "Cleanup: how much Youch! tidies what you said" with options "Light", "Medium", "Heavy", "Light" selected.
  3. Segmented control "Rewording: how far Youch! may reword" with options "Off", "Low", "High", "Off" selected.
  4. Segmented control "Appearance" with options "Light", "Dark", "Match system", "Light" selected.
  5. Toggle row "Fix spoken corrections at Light too", on, with ""Eight, no wait, five" becomes "five".".
  6. Toggle row "Show the Youch! button", on, with "A small button at the bottom of the screen.".
  7. Toggle row "Launch at login", off.
  8. List group "Models, on this Mac" with 4 rows: "Speech model" (Parakeet TDT 0.6B v2, 464 MB · Ready); "Vocabulary model" (Parakeet CTC 110M, 103 MB · Ready); "Cleanup model" (Qwen3 1.7B, 1.4 GB · Ready); "Speaker model" (diarization, 129 MB · Download), in the inspector column.
- Signature placement: the dictation key drawn as a keycap.
- Fold budget: the dictation key, Cleanup and Rewording sit above the fold.
- States:
  - Empty: none.
  - Loading: none.
  - Error: a model download that failed: "Download stopped. Try again" in ink with an icon.
  - First run: none.

##### Welcome
- Job: Say what Youch! is in one line and start setup.
- Primary action: Get started
- Chrome: None: title bar only, no sidebar and no toolbar
- Content, ranked:
  1. Large title "Youch!".
  2. Body line "Speech-to-text that just works. Locally.".
  3. Body line "Hold Right Command, say it, let go. Youch! pastes it where you're typing.".
  4. Muted caption "Youch! uses models that run on this Mac (2.1 GB). You choose when they download, on the next screen.".
  5. The one primary button "Get started".
  6. progress "Step 1 of 8".
- Signature placement: the hold-to-talk key, drawn as a keycap.
- Fold budget: everything.
- States:
  - Empty: none.
  - Loading: none.
  - Error: none.
  - First run: this is the first run.

##### Try it
- Job: Let Walker dictate once into a practice box and see it work.
- Primary action: Finish
- Chrome: None: title bar only, no sidebar and no toolbar
- Content, ranked:
  1. Large title "Try it".
  2. Body line "Hold Right Command and say something, then let go. Your words land on the line below.".
  3. Muted caption "Your first dictation lands here as a talk line, then as text.".
  4. progress "Downloading models".
  5. The one primary button "Finish", pinned in a bottom bar above the home indicator or tab bar, always above the fold.
  6. Text link "Skip practice".
- Signature placement: the practice box filling with what he said.
- Fold budget: everything.
- States:
  - Empty: the empty practice box.
  - Loading: models still downloading; Finish waits until they are ready.
  - Error: "Didn't catch anything. Hold the key a little longer."
  - First run: this is the first run.

#### Phone layout and type (Guided)
| Role | Face | Size pt | Line | Weight |
| --- | --- | --- | --- | --- |
| Display | Outfit (display), tracking -0.04em | 34 | 41 | 600 |
| Eyebrow | Inter (body) | 13 | 18 | 400 |
| Label | Inter (body) | 13 | 18 | 400 |
| Large title | Outfit (display), tracking -0.02em | 34 | 41 | 600 |
| Title | Outfit (display), tracking -0.02em | 28 | 34 | 600 |
| Title 2 | Outfit (display), tracking -0.02em | 22 | 28 | 600 |
| Headline | Inter (body) | 17 | 22 | 500 |
| Body | Inter (body) | 17 | 24 | 400 |
| Callout | Inter (body) | 16 | 22 | 400 |
| Subhead | Inter (body) | 15 | 20 | 400 |
| Footnote | Inter (body) | 13 | 18 | 400 |
| Caption | Inter (body) | 12 | 16 | 600 |
| Tab label | Inter (body) | 10 | 12 | 600 selected, 500 unselected |
- Phone chrome: the status bar takes 54pt at the top and the home indicator 34pt at the bottom; nothing tappable sits in either. The top bar is 44pt high, under the status bar. At rest it shows only the back button and icon actions, with the Large title below it in the content; the title appears in the top bar (Headline size) only once the Large title has scrolled under it.
- Title colours: welcome title --ink, screen titles --ink, eyebrows --ab-muted.
- Layout: 20pt side margins on every screen. Spacing comes from 4, 8, 12, 16, 20, 24, 28, 32, 40, 48pt only; 28pt between sections. Sizes: buttons 52pt, fields 48pt, list rows 52pt with one line and 60pt with a detail line, card insides as the Home card in the sample screens, tab bar 83pt, nothing tappable under 44pt.
- Support Dynamic Type; never let a word split or a label truncate; one Large title per screen.

#### Light and dark (Locked)
The default look is light, as the sample screens draw it: `color-scheme: light` and the light values on `:root`. Dark is used only when the system asks for it (`[data-theme="dark"]`, set from `prefers-color-scheme: dark` by the script under Tokens). The dark values are designed, not inverted. Text on the canvas uses `--ink` / `--muted`, with each mode's value from the Colors table.

#### States (Locked)
| State | Colour | Visual |
| --- | --- | --- |
| Pressed and disabled | as each UI kit row states | The "Other states" column of the UI kit is the one definition; nothing else changes on press. Disabled controls take no press response. |
| Focus | `--ink` | Keyboard focus on any control: a 2pt ring with a 2pt gap, following the control's corners; exactly as the "focus" state of the Primary and Secondary button rows in the UI kit draws it. Shown on keyboard focus only (`:focus-visible` on the web), never on tap or click; never removed. Text fields show their own focus state from the UI kit instead. |
| Empty | `--ink` headline, `--muted` copy | The Empty state row of the UI kit. |
| Loading | `--line` track, `--ink` fill | Indeterminate bar, or skeleton blocks in `--line` easing between 100% and 60% opacity every 1.2 s. Show it after 300 ms of waiting, with a text label for screen readers. |
| Error | `--error` | The Text field row's error state, with the message under the field. |

#### Motion (Guided)
- Durations: fast 120 ms (press, toggle), base 180 ms (color, selection, shadow), slow 240 ms (sheets, page changes). Easing: ease-out `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Reduce Motion: Replace slides and fades with an instant state swap; colour changes stay. State changes stay; only the movement goes. Nothing else animates idly or loops except loading indicators.

#### Accessibility (Locked)
- Contrast kept (light | dark): ink on canvas 18.0 | 18.0 (AAA); muted on canvas 4.9 | 6.9 (AA); on-primary on primary 18.9 | 18.9 (AAA); on-secondary on secondary 5.9 | 5.9 (AA); error on canvas 18.0 | 18.0 (AAA). Keep every text pair at 4.5:1 or better (3:1 for the accent-ink highlight word); do not swap tokens in a way that breaks them.
- Every tappable target is at least 44x44 CSS px even when the visible shape is smaller, with 8pt between neighbours. Text scales: sizes in rem, no fixed-height text boxes; layouts reflow at the largest accessibility size (stack, wrap, never truncate a primary label).
- Increase Contrast (`prefers-contrast: more`): Hairlines become 2pt `--ink`, `--muted` text becomes `--ink`, tints get a 1pt `--ink` edge.
- Reduce Motion (`prefers-reduced-motion`): see Motion. Never color alone: selection, status and errors also use an icon, text or shape; icon-only buttons carry an accessibility label.

#### Icons (Locked)
Text-first: nav and buttons carry no icons; where an icon is needed it is a 1.75px stroke, square caps, drawn on a 20px grid. Web: inline SVG on a 24px grid, `currentColor`.
- Sizes as the sample screens draw them: 24pt tab bar icons over their 10pt labels; 20pt icons in icon buttons, centred in a 44x44pt hit area; 18pt icons inside the 32pt feature-row chips; 16pt chevrons in the trailing slot of rows, never a text glyph (no ›, > or →); 24pt anywhere else.
- Glyphs the kit uses (draw each once, same stroke): back, more, notifications (bell), search, chevron right, chevron down, check, plus, info, success, warning, error, inbox (empty state), home, list, heart, user.

#### Fonts to bundle (Locked)
- Outfit: 600 (Display, Large title, Title, Title 2, UI kit).
- Inter: 400 (Eyebrow, Label, Body, Callout, Subhead, Footnote, UI kit), 500 (Headline, UI kit), 600 (Caption, Tab label, UI kit).
- Geist Mono: 600 (UI kit).
- System faces, no file to bundle: -apple-system.
- Bundle exactly these weights and no others; the type scale uses no more. Web: https://fonts.googleapis.com/css2?family=Geist+Mono:wght@600&family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600&family=Outfit:wght@600&display=swap

#### Signature and product imagery (Guided)
- Embedded product screenshots, app icons and product imagery keep their own colours. They are exempt from the canvas and colour coverage budget and from the accent and primary limits; the studio frame around them (surfaces, captions, borders) follows the brand rules.
- Coverage and whitespace targets apply to the brand's own surfaces, not to product pages that showcase a product's own visual system.

#### Do and don't (Guided)
- Do: Fill the selected item and the main action with solid ink; selection reads without colour.
- Do: Keep corners at 6px on controls and 0 on planes; circles only for voice.
- Don't: Use periwinkle on a button, a selected nav item or a segment.
- Don't: Set nav items, buttons or inline actions in tracked capitals; tracked caps are for section labels only.

#### Tokens (CSS) (Locked)
```css
:root {
  color-scheme: light;
  --canvas: #fafaf7; --ink: #101116; --muted: #6e6e70;
  --line: #d7d7d5; --primary: #101116; --on-primary: #ffffff;
  --secondary: #8290c7; --on-secondary: #141414; --error: #101116;
  --on-error: #fafaf7; --kit-primary: #46464a; --kit-secondary: #46464a;
  --kit-field: rgba(16, 17, 22, 0.5); --kit-field-2: #c62f2f; --white: #ffffff;
  --ab-muted: #5b5b5e; --success-icon: #717dac; --primary-text: #101116;
  --black: #000000; --kit-progress-text: #7c7c7f; --kit-stepper-text: #3b3a38;
  --kit-spinner-text: #7e7e80; --accent: #f6cf6b; --on-accent: #141414;
  --accent-ink: #101116; --pri-tint: #dededc; --sec-tint: #e7e9ef;
  --kit-stepper: #3b3a38;
  --font-heading: "Outfit", -apple-system, sans-serif; --font-body: "Inter", -apple-system, sans-serif;
  --font-geist-mono: "Geist Mono", ui-monospace, monospace;
  --text-display: 34px; --text-eyebrow: 13px; --text-label: 13px; --text-large-title: 34px; --text-title: 28px; --text-title-2: 22px; --text-headline: 17px; --text-body: 17px; --text-callout: 16px; --text-subhead: 15px; --text-footnote: 13px; --text-caption: 12px; --text-tab-label: 10px;
  --space-4: 4px; --space-8: 8px; --space-12: 12px; --space-16: 16px; --space-20: 20px; --space-24: 24px; --space-28: 28px; --space-32: 32px; --space-40: 40px; --space-48: 48px;
  --status-bar: 54px; --home-indicator: 34px; --top-bar: 44px; --tab-bar: 83px; --margin: 20px;
  --row: 52px; --row-detail: 60px;
  --radius-control: 6px; --radius-field: 0px; --radius-card: 0px; --hit: 44px;
  --shadow-field: var(--kit-field) 0 0 0 1px inset; --shadow-select: var(--kit-field) 0 0 0 1px inset;
  --shadow-toggle: var(--ink) 0 0 0 1px inset; --shadow-combo: var(--kit-field) 0 0 0 1px inset;
  --shadow-date-field: var(--kit-field) 0 0 0 1px inset;
  --dur-fast: 120ms; --dur-base: 180ms; --dur-slow: 240ms; --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --canvas: #101116; --ink: #fafaf7; --muted: #9c9d9d;
  --line: #333438; --error: #fafaf7; --on-error: #101116;
  --kit-primary: #fafaf7; --kit-secondary: #b6b7b6; --kit-field: rgba(250, 250, 247, 0.31);
  --kit-field-2: #ff7b72; --ab-muted: #9c9d9d; --success-icon: #8290c7;
  --primary-text: #858687; --kit-progress-text: #fafaf7; --kit-stepper-text: #807f7e;
  --kit-spinner-text: #6d6e6d; --accent-ink: #f6cf6b; --pri-tint: #101116;
  --sec-tint: #222532;
}
@media (prefers-reduced-motion: reduce) { :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; } }
```
Follow the system appearance:
```js
const darkMq = matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () => { document.documentElement.dataset.theme = darkMq.matches ? 'dark' : 'light'; };
applyTheme(); darkMq.addEventListener('change', applyTheme);
```

#### App icon (Locked)
The navy ripple tile: a periwinkle disc with cream arcs on #16214a. Deliver a 1024x1024 master without transparency or pre-rounded corners (the system masks it), a dark variant on `#101116` and a tinted variant (glyph only, one color), and derive every other size from the master. Web: also a 512px maskable icon and a 32px favicon from the same master.

## Part 2: Design tokens

These are the brand's tokens: use them as given, and use nothing else for colour, type or spacing. The first block is the same file "Save + files" writes; the last block holds the values of every custom property the Part 3 CSS reads, resolved on the kit root, so every `var(--x)` in Part 3 has a value here.

### tokens.css

```css
:root {
  color-scheme: light;
  --canvas: #fafaf7; --ink: #101116; --muted: #6e6e70;
  --line: #d7d7d5; --primary: #101116; --on-primary: #ffffff;
  --secondary: #8290c7; --on-secondary: #141414; --error: #101116;
  --on-error: #fafaf7; --kit-primary: #46464a; --kit-secondary: #46464a;
  --kit-field: rgba(16, 17, 22, 0.5); --kit-field-2: #c62f2f; --white: #ffffff;
  --ab-muted: #5b5b5e; --success-icon: #717dac; --primary-text: #101116;
  --black: #000000; --kit-progress-text: #7c7c7f; --kit-stepper-text: #3b3a38;
  --kit-spinner-text: #7e7e80; --accent: #f6cf6b; --on-accent: #141414;
  --accent-ink: #101116; --pri-tint: #dededc; --sec-tint: #e7e9ef;
  --kit-stepper: #3b3a38;
  --font-heading: "Outfit", -apple-system, sans-serif; --font-body: "Inter", -apple-system, sans-serif;
  --font-geist-mono: "Geist Mono", ui-monospace, monospace;
  --text-display: 34px; --text-eyebrow: 13px; --text-label: 13px; --text-large-title: 34px; --text-title: 28px; --text-title-2: 22px; --text-headline: 17px; --text-body: 17px; --text-callout: 16px; --text-subhead: 15px; --text-footnote: 13px; --text-caption: 12px; --text-tab-label: 10px;
  --space-4: 4px; --space-8: 8px; --space-12: 12px; --space-16: 16px; --space-20: 20px; --space-24: 24px; --space-28: 28px; --space-32: 32px; --space-40: 40px; --space-48: 48px;
  --status-bar: 54px; --home-indicator: 34px; --top-bar: 44px; --tab-bar: 83px; --margin: 20px;
  --row: 52px; --row-detail: 60px;
  --radius-control: 6px; --radius-field: 0px; --radius-card: 0px; --hit: 44px;
  --shadow-field: var(--kit-field) 0 0 0 1px inset; --shadow-select: var(--kit-field) 0 0 0 1px inset;
  --shadow-toggle: var(--ink) 0 0 0 1px inset; --shadow-combo: var(--kit-field) 0 0 0 1px inset;
  --shadow-date-field: var(--kit-field) 0 0 0 1px inset;
  --dur-fast: 120ms; --dur-base: 180ms; --dur-slow: 240ms; --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --canvas: #101116; --ink: #fafaf7; --muted: #9c9d9d;
  --line: #333438; --error: #fafaf7; --on-error: #101116;
  --kit-primary: #fafaf7; --kit-secondary: #b6b7b6; --kit-field: rgba(250, 250, 247, 0.31);
  --kit-field-2: #ff7b72; --ab-muted: #9c9d9d; --success-icon: #8290c7;
  --primary-text: #858687; --kit-progress-text: #fafaf7; --kit-stepper-text: #807f7e;
  --kit-spinner-text: #6d6e6d; --accent-ink: #f6cf6b; --pri-tint: #101116;
  --sec-tint: #222532;
}
@media (prefers-reduced-motion: reduce) { :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; } }
```

### Resolved custom properties read by the kit CSS

Set these on the kit root (the element carrying class `ab sb-ab`) before the Part 3 CSS applies. The first block is the light look; the second lists only the values that differ in dark, scoped by `data-mode`.

```css
.ab.sb-ab {
  --ab-accent: #101116;
  --ab-accent-ink: #101116;
  --ab-accent-mark: #f6cf6b;
  --ab-canvas: #fafaf7;
  --ab-display: 1;
  --ab-font-b: "Inter", -apple-system, sans-serif;
  --ab-font-h: "Outfit", -apple-system, sans-serif;
  --ab-font-label: "Inter", -apple-system, sans-serif;
  --ab-font-ui: "Inter", -apple-system, sans-serif;
  --ab-hl-scale: 0.86;
  --ab-hs: 1;
  --ab-ink: #101116;
  --ab-line: #d7d7d5;
  --ab-muted: #5b5b5e;
  --ab-on-accent: #fafaf7;
  --ab-on-primary: #ffffff;
  --ab-on-secondary: #141414;
  --ab-pri-tint: color-mix(in srgb, #101116 4%, #fafaf7);
  --ab-primary: #101116;
  --ab-primary-text: #101116;
  --ab-sec-tint: #e7e9ef;
  --ab-secondary: #8290c7;
  --k-body: 17px;
  --k-body-lh: 24px;
  --k-btn: 52px;
  --k-callout: 16px;
  --k-callout-lh: 22px;
  --k-caption: 12px;
  --k-caption-lh: 16px;
  --k-cardpad: 20px;
  --k-err: #101116;
  --k-err-ico: #101116;
  --k-field: 48px;
  --k-footnote: 13px;
  --k-footnote-lh: 18px;
  --k-gap: 28px;
  --k-headline: 17px;
  --k-headline-lh: 22px;
  --k-info: #101116;
  --k-info-ico: #101116;
  --k-large-title: 34px;
  --k-large-title-lh: 41px;
  --k-margin: 20px;
  --k-muted: color-mix(in srgb, #101116 28%, #5b5b5e);
  --k-ok: #8290c7;
  --k-ok-ico: #717dac;
  --k-pri-on-tint: #101116;
  --k-pri-text: #101116;
  --k-r: min(6px, 16px);
  --k-row: 52px;
  --k-subhead: 15px;
  --k-subhead-lh: 20px;
  --k-tab: 83px;
  --k-tab-label: 10px;
  --k-tab-label-lh: 12px;
  --k-tap: 44px;
  --k-title: 28px;
  --k-title-2: 22px;
  --k-title-2-lh: 28px;
  --k-title-lh: 34px;
  --k-ui: Inter, -apple-system, sans-serif;
  --k-warn: #101116;
  --k-warn-ico: #101116;
  --mv-hair: rgba(16,17,22,0.5);
  --mv-hair-soft: rgba(16,17,22,0.16);
  --mv-hair-strong: #101116;
  --sb-card-r: 0px;
  --sb-danger: #101116;
  --sb-danger-on: #fafaf7;
  --sb-danger-text: #101116;
  --sb-focus-auto: #101116;
  --sb-focus-offset: 2px;
  --sb-focus-w: 2px;
  --sb-r: 6px;
  --sb-ui-ff: Inter, -apple-system, sans-serif;
  --sb-ui-ls: 0;
  --sb-ui-tt: none;
}
```

```css
.ab.sb-ab[data-mode="dark"] {
  --ab-accent: #fafaf7;
  --ab-accent-ink: #f6cf6b;
  --ab-accent-mark: transparent;
  --ab-canvas: #101116;
  --ab-ink: #fafaf7;
  --ab-line: #333438;
  --ab-muted: #9c9d9d;
  --ab-on-accent: #101116;
  --ab-pri-tint: color-mix(in srgb, #fafaf7 4%, #101116);
  --ab-primary-text: #fafaf7;
  --ab-sec-tint: #222532;
  --k-err: #fafaf7;
  --k-err-ico: #fafaf7;
  --k-info-ico: #6e6e70;
  --k-muted: color-mix(in srgb, #fafaf7 28%, #9c9d9d);
  --k-ok-ico: #8290c7;
  --k-pri-on-tint: #858687;
  --k-pri-text: #858687;
  --k-warn: #fafaf7;
  --k-warn-ico: #fafaf7;
  --mv-hair: rgba(250,250,247,0.31);
  --mv-hair-soft: rgba(250,250,247,0.16);
  --mv-hair-strong: #fafaf7;
  --sb-danger: #fafaf7;
  --sb-danger-on: #101116;
  --sb-danger-text: #fafaf7;
  --sb-focus-auto: #fafaf7;
}
```

Set per element (in the markup's inline `style` or by a rule inside `kit.css`, not on the root): `--h`, `--k-picked`, `--pr`, `--t`, `--tone`, `--tone-ico`, `--v`, `--wr`.

Optional hooks this style does not set (each `var()` in `kit.css` carries its own fallback, so leave them unset): `--k-arrow-edge`, `--k-callout-edge-w`, `--k-callout-fill`, `--k-callout-r`, `--k-callout-shadow`, `--k-dis-label`, `--k-sheet-r`, `--k-sheet-shadow`, `--sb-focus`.

## Part 3: UI kit source

First comes `kit.css`: every CSS rule that draws the UI kit in this style, in cascade order, grouped by the file it came from. Then each component, with what it is for, its iOS treatment, its states and the reference markup of every state. Port the CSS values exactly; treat the markup as illustrative.

### Kit root

Every selector in `kit.css` is scoped to this root. Rename or fold the scope into your own, but keep the same attributes' meaning (`data-ae` is the style, `data-mode` is light or dark).

```html
<section class="ab sb-ab sb-window sb-kit" data-ae="youch-voice-line" data-mode="light" data-accent-text="low" data-hero="split" data-palette="strips" data-sections="asym" data-highlight="ink" data-states="button" data-subcopy="on" data-hcls="geometric" data-bcls="neo-grotesk" data-sb-danger="ink" data-k-field="box" data-ab-hs0="1" data-ab-hs-fit="1">
  <!-- a component's reference markup goes here -->
</section>
```

### kit.css

490 rules from 4 files: `baseline`, `css/aesthetic-board.css`, `css/see-built.css`, `inline <style>`.

```css
/* ===== baseline (from css/styles.css) ===== */
*,
::before,
::after {
  box-sizing: border-box;
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* ===== css/aesthetic-board.css ===== */
.ab {
  container: ab / inline-size;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--ab-canvas);
  color: var(--ab-ink);
  font-family: var(--ab-font-ui, var(--ab-font-b));
  --ab-pad: clamp(20px, 4.4cqw, 44px);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0px;
  text-transform: none;
  text-align: left;
  border-radius: 20px;
  -webkit-font-smoothing: antialiased;
  font-synthesis: none;
}

.ab *,
.ab ::before,
.ab ::after {
  box-sizing: border-box;
}

:where(.ab) button,
:where(.ab) input {
  font: inherit;
  color: inherit;
}

.ab h2,
.ab h3,
.ab p,
.ab ul {
  margin: 0px;
  padding: 0px;
}

.ab i {
  font-style: normal;
}

.ab-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0px;
  font-family: var(--ab-font-h);
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: clamp(15px, 2cqw, 19px);
}

.ab-wordmark {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ab:not(.ab-slide) .ab-wordmark {
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  overflow-wrap: anywhere;
}

.ab-mark {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--ab-ink);
  color: var(--ab-canvas);
  font: 700 14px/1 var(--ab-font-h);
}

.ab-rule {
  height: 1px;
  background: var(--ab-line);
}

.ab-label,
.ab-fieldlabel {
  font-family: var(--ab-font-label, var(--ab-font-ui, var(--ab-font-b)));
}

.ab-labelrow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.ab-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ab-muted);
}

.ab-headline {
  font-family: var(--ab-font-h);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.03em;
  font-size: calc(clamp(32px, 7.4cqw, 70px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1));
  text-wrap: balance;
  overflow-wrap: normal;
}

.ab[data-ae] .ab-headline:not([data-wrap-last-resort]) {
  overflow-wrap: normal;
}

.ab-hl-glue {
  white-space: nowrap;
}

.ab-subcopy {
  max-width: 36em;
  text-wrap: pretty;
  font-family: var(--ab-font-b);
  font-size: clamp(13.5px, 1.5cqw, 16px);
  line-height: 1.5;
  color: var(--ab-muted);
  margin-top: clamp(14px, 2cqw, 22px) !important;
}

.ab:where([data-highlight="ink"]) .ab-hl {
  color: var(--ab-accent-ink);
  background-image: linear-gradient(transparent 62%, var(--ab-accent-mark, transparent) 62%, var(--ab-accent-mark, transparent) 94%, transparent 94%);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.ab-card {
  padding: clamp(18px, 2.8cqw, 26px);
  border-radius: 16px;
}

.ab-seg {
  display: flex;
  gap: 4px;
  padding: 5px;
  border-radius: 12px;
}

.ab-seg-btn {
  flex: 1 1 0%;
  min-height: 36px;
  padding: 8px 6px;
  border: 0px;
  background: transparent;
  border-radius: 9px;
  font-size: 12px;
  color: var(--ab-muted);
  cursor: pointer;
}

.ab-seg-btn[aria-pressed="true"] {
  color: var(--ab-ink);
  font-weight: 600;
}

.ab-card-title {
  font-family: var(--ab-font-h);
  font-weight: 600;
  font-size: clamp(21px, 2.7cqw, 27px);
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 24px 0px 8px !important;
}

.ab-card-body {
  font-family: var(--ab-font-b);
  font-size: 13px;
  color: var(--ab-muted);
  margin-bottom: 22px !important;
}

.ab-cta {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 16px;
  border: 0px;
  border-radius: 10px;
  cursor: pointer;
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  font-size: 13.5px;
  font-weight: 600;
}

.ab-cta-arrow::before {
  content: "↗";
}

.ab-fieldlabel {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
}

.ab .ab-input {
  display: block;
  width: 100%;
  height: auto;
  margin-bottom: 18px;
  padding: 13px 15px;
  border: 1px solid var(--ab-line);
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 15px;
  font-weight: inherit;
  text-transform: none;
  letter-spacing: 0px;
  outline: none;
}

.ab[data-ae] .ab-input:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 2px;
}

.ab-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  font-size: 13px;
  cursor: pointer;
}

.ab-switch {
  appearance: none;
  position: relative;
  flex: 0 0 auto;
  margin: 0px;
  width: 50px;
  height: 29px;
  border-radius: 20px;
  cursor: pointer;
  background: var(--ab-line);
  transition: background 0.18s;
}

.ab-switch::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 4px;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: var(--ab-canvas);
  transition: transform 0.18s;
}

.ab-switch:checked {
  background: var(--ab-primary);
}

.ab-switch:checked::before {
  transform: translateX(21px);
}

.ab-list {
  list-style: none;
}

.ab-row {
  display: grid;
  align-items: center;
  gap: 4px clamp(10px, 2cqw, 20px);
  padding: 13px 2px;
  grid-template-columns: 2.6ch minmax(0px, 1fr) auto minmax(60px, 150px) 4.5ch;
  border-top: 1px solid var(--ab-line);
  font-size: 13px;
}

.ab-row:last-child {
  border-bottom: 1px solid var(--ab-line);
}

.ab-row-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--ab-line);
  overflow: hidden;
}

.ab-row-bar i {
  display: block;
  height: 100%;
  background: var(--ab-secondary);
}

.ab-fit {
  display: inline-block;
  padding: 2px 9px;
  border: 1px solid var(--ab-line);
  border-radius: 999px;
  font-family: var(--ab-font-label, var(--ab-font-ui, var(--ab-font-b)));
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  letter-spacing: 0px;
  text-transform: none;
  color: var(--ab-ink);
}

.ab-fit[data-fit="match"] {
  background: var(--ab-sec-tint);
  border-color: transparent;
  color: var(--ab-ink);
}

.ab-type-apply {
  padding: 10px 16px;
  border: 1px solid var(--ab-ink);
  border-radius: 10px;
  background: transparent;
  color: var(--ab-ink);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.ab-type-apply:hover {
  background: var(--ab-pri-tint);
}

.ab-type-apply:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 2px;
}

@container ab (max-width: 600px) {
  .ab-headline {
    font-size: calc(clamp(30px, 10.5cqw, 52px) * var(--ab-hl-scale, 1) * var(--ab-hs, 1) * var(--ab-display, 1));
  }

  .ab-brand {
    flex: 1 1 auto;
  }

  .ab-labelrow {
    flex-wrap: wrap;
    row-gap: 4px;
  }

  .ab-labelrow > .ab-label:last-child:not(:first-child) {
    white-space: nowrap;
  }

  .ab-row {
    grid-template-columns: 2.6ch minmax(0px, 1fr) 4.5ch;
    row-gap: 6px;
  }

  .ab-row-bar {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab *,
  .ab ::before,
  .ab ::after {
    transition: none !important;
    animation: auto ease 0s 1 normal none running none !important;
  }
}

/* ===== css/see-built.css ===== */
.sb-single > .sb-window {
  min-height: 100%;
}

:is(.ab.sb-ab, .sb-gen) {
  --sb-danger: #c62f2f;
  --sb-danger-line: rgba(198, 47, 47, 0.35);
  --sb-danger-on: #fff;
}

:is(.ab.sb-ab, .sb-gen) {
  --sb-danger-text: color-mix(in srgb, var(--sb-danger) 62%, var(--ab-ink, #111));
}

:is(.ab.sb-ab, .sb-gen)[data-mode="dark"] {
  --sb-danger: #ff7b72;
  --sb-danger-line: rgba(255, 123, 114, 0.4);
  --sb-danger-on: #1a0505;
}

:is(.ab.sb-ab, .sb-gen) .sb-ico {
  display: block;
  flex: 0 0 auto;
}

:is(.ab.sb-ab, .sb-gen) :is(button, a) {
  -webkit-tap-highlight-color: transparent;
}

.ab.sb-ab.sb-window {
  min-height: 100%;
}

.sb-search {
  position: relative;
  width: clamp(180px, 24cqw, 260px);
}

.sb-search > .sb-ico {
  position: absolute;
  left: 12px;
  top: 50%;
  translate: 0px -50%;
  z-index: 1;
  color: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  pointer-events: none;
}

:is(.ab.sb-ab, .sb-gen) .sb-search .ab-input {
  margin: 0px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 36px;
  font-size: 13px;
}

:is(.ab.sb-ab, .sb-gen) .ab-type-apply.sb-icon-btn {
  position: relative;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  padding: 0px;
  flex: 0 0 auto;
}

.sb-badge {
  position: absolute;
  top: 8px;
  right: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ab-accent);
  box-shadow: 0 0 0 2px var(--ab-canvas);
}

:is(.ab.sb-ab, .sb-gen) .ab-row[tabindex] {
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen) .ab-row[tabindex]:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: -2px;
}

:is(.ab.sb-ab, .sb-gen) .ab-row.is-picked {
  background-color: var(--ab-pri-tint);
}

:is(.ab.sb-ab, .sb-gen) .sb-field .ab-input {
  margin-bottom: 16px;
}

:is(.ab.sb-ab, .sb-gen) .ab-toggle.sb-tog {
  min-height: 54px;
  padding: 6px 0px;
}

.sb-phone-in {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 54px var(--k-margin, 20px) 0;
}

.sb-phone-in > * {
  flex-shrink: 0;
}

.sb-statusbar {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 54px;
  padding: 4px 30px 0px 46px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font: 600 17px / 1 -apple-system, system-ui, sans-serif;
  letter-spacing: 0px;
  color: var(--ab-ink);
  text-transform: none;
}

.sb-sb-r {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sb-sig {
  width: 18px;
  height: 11px;
  background: linear-gradient(90deg, currentcolor 0px, currentcolor 3px, transparent 3px, transparent 5px, currentcolor 5px, currentcolor 8px, transparent 8px, transparent 10px, currentcolor 10px, currentcolor 13px, transparent 13px, transparent 15px, currentcolor 15px, currentcolor 18px);
  clip-path: polygon(0px 75%, 100% 0px, 100% 100%, 0px 100%);
}

.sb-wifi {
  width: 16px;
  height: 11px;
  border-radius: 14px 14px 0px 0px;
  background: currentcolor;
  clip-path: polygon(50% 100%, 0px 20%, 100% 20%);
}

.sb-bat {
  position: relative;
  width: 26px;
  height: 13px;
  border: 1.5px solid;
  border-radius: 4px;
  opacity: 0.9;
}

.sb-bat::after {
  content: "";
  position: absolute;
  inset: 1.5px 6px 1.5px 1.5px;
  border-radius: 1.5px;
  background: currentcolor;
}

.sb-homebar {
  position: absolute;
  z-index: 3;
  bottom: 8px;
  left: 50%;
  width: 134px;
  height: 5px;
  margin-left: -67px;
  border-radius: 3px;
  background: var(--ab-ink);
  opacity: 0.85;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-headline.sb-ob-h {
  max-width: none;
  text-wrap: balance;
  margin: 0px !important;
  font-size: var(--k-large-title, 34px) !important;
  line-height: var(--k-large-title-lh, 41px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-subcopy.sb-ob-body {
  max-width: none;
  margin: 12px 0px 0px !important;
  font-size: var(--k-body, 17px) !important;
  line-height: var(--k-body-lh, 24px) !important;
}

:is(.ab.sb-ab, .sb-gen) .sb-k-row.sb-k-cut {
  display: none !important;
}

.sb-tabs {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, minmax(0px, 1fr));
  align-items: start;
  height: var(--k-tab, 83px);
  margin: auto calc(-1 * var(--k-margin, 20px)) 0;
  padding: 6px 6px 34px;
  border-top: 1px solid var(--ab-line);
  background: color-mix(in srgb, var(--ab-canvas) 92%, transparent);
}

.sb-tab {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 3px;
  min-width: 0px;
  padding: 2px 0px 6px;
  border: 0px;
  background: none;
  cursor: pointer;
  font-family: var(--sb-ui-ff, var(--ab-font-ui));
  font-size: var(--k-tab-label, 10px);
  line-height: var(--k-tab-label-lh, 12px);
  font-weight: 500;
  color: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
}

.sb-tab span {
  max-width: 100%;
  white-space: nowrap;
}

.sb-tab[aria-current] {
  color: var(--ab-ink);
  font-weight: 600;
}

.sb-tab[aria-current]::before {
  content: "";
  position: absolute;
  bottom: 0px;
  left: 50%;
  width: 16px;
  margin-left: -8px;
  height: 3px;
  border-radius: 3px;
  background: var(--ab-primary);
}

.sb-tab[aria-current] > .sb-ico {
  color: var(--k-pri-text, var(--ab-primary-text, var(--ab-primary)));
}

.sb-tab:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: -2px;
}

.sb-k-mid {
  margin: 0px 0.12em;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.ab-card, .ab-panel, .ab-list) {
  --k-muted: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  --k-picked: color-mix(in srgb, var(--ab-primary) 12%, transparent);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row.sb-k-row.is-picked {
  background-color: var(--k-picked, var(--ab-pri-tint));
}

:is(.ab.sb-ab, .sb-gen).sb-kit {
  --k-ui: var(--sb-ui-ff, var(--ab-font-ui, var(--ab-font-b)));
  --k-muted: color-mix(in srgb, var(--ab-ink) 28%, var(--ab-muted));
  --k-r: min(var(--sb-r, 12px), 16px);
  --sb-focus-w: 2px;
  --sb-focus-offset: 2px;
}

:where(.ab.sb-ab, .sb-gen).sb-kit .sb-k-focus,
:where(.ab.sb-ab, .sb-gen).sb-kit :where(.sb-k-btn, .sb-k-btn2, .sb-k-textbtn, .sb-k-danger, .sb-k-iconbtn):focus-visible {
  outline: var(--sb-focus-w) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: var(--sb-focus-offset);
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.ab-cta.sb-k-btn, .ab-type-apply.sb-k-btn2) {
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: normal;
  min-height: var(--k-btn, 52px) !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: var(--k-headline, 17px) !important;
  line-height: var(--k-headline-lh, 22px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-type-apply.sb-k-btn2 {
  justify-content: center;
  text-align: center;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-cta.sb-k-btn .ab-cta-arrow {
  flex: 0 0 auto;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-type-apply.sb-k-btn2.sb-k-auto {
  width: auto;
  padding-left: 20px !important;
  padding-right: 20px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pressed {
  box-shadow: inset 0 0 0 100vmax color-mix(in srgb, var(--ab-ink) 7%, transparent);
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-btn, .sb-k-btn2, .sb-k-textbtn, .sb-k-danger, .sb-k-iconbtn):disabled {
  cursor: not-allowed;
  color: var(--k-dis-label, var(--k-muted)) !important;
  box-shadow: inset 0 0 0 100vmax color-mix(in srgb, var(--ab-canvas) 58%, transparent) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-btn, .sb-k-btn2):disabled * {
  color: inherit !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-box, .ab-switch):disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-check, .ab-toggle).is-disabled {
  cursor: not-allowed;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-check, .ab-toggle).is-disabled > span {
  color: var(--k-muted) !important;
}

.sb-k-textbtn {
  min-height: var(--k-tap, 44px);
  padding: 0px 4px;
  border: 0px;
  background: none;
  cursor: pointer;
  font-family: var(--k-ui);
  font-size: var(--k-headline, 17px);
  line-height: var(--k-headline-lh, 22px);
  font-weight: 600;
  color: var(--k-pri-text, var(--ab-primary-text, var(--ab-ink)));
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
  white-space: nowrap;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-textbtn.sb-k-pressed {
  box-shadow: none;
  color: var(--k-muted);
}

.sb-k-danger {
  width: 100%;
  min-height: var(--k-btn, 52px);
  padding: 0px 20px;
  cursor: pointer;
  border: 1px solid var(--sb-danger);
  border-radius: min(var(--sb-r, 10px), 999px);
  background: var(--sb-danger);
  color: var(--sb-danger-on, #fff);
  font-family: var(--k-ui);
  font-size: var(--k-headline, 17px);
  font-weight: 600;
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 6px 16px -8px color-mix(in srgb, var(--sb-danger) 35%, transparent);
}

:is(.ab.sb-ab, .sb-gen)[data-sb-danger="ink"] .sb-k-danger {
  border: 1.5px solid var(--ab-ink);
  background: transparent;
  color: var(--ab-ink);
  box-shadow: none;
}

:is(.ab.sb-ab, .sb-gen)[data-sb-danger="ink"].sb-kit .sb-k-danger.sb-k-pressed {
  background: color-mix(in srgb, var(--ab-ink) 8%, transparent);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-type-apply.sb-k-iconbtn {
  box-sizing: border-box;
  width: var(--k-tap, 44px);
  height: var(--k-tap, 44px);
  min-width: var(--k-tap, 44px) !important;
  min-height: var(--k-tap, 44px) !important;
  padding: 0px !important;
}

.sb-k-plain {
  display: grid;
  place-items: center;
  width: var(--k-tap, 44px);
  height: var(--k-tap, 44px);
  padding: 0px;
  border: 0px;
  background: none;
  color: var(--ab-ink);
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-split {
  display: flex;
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-split > .sb-k-split-main {
  flex: 1 1 0px;
  width: auto;
  min-width: 0px;
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-split > .sb-k-split-more {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: var(--k-btn, 52px);
  margin-left: -1px;
  border-left: 1px solid color-mix(in srgb, var(--ab-on-primary) 40%, transparent);
  cursor: pointer;
  min-height: var(--k-btn, 52px) !important;
  padding: 0px !important;
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-splitwrap > .sb-k-menu {
  width: min(100%, 240px);
  margin: 6px 0px 0px auto !important;
}

.sb-k-fabbox {
  position: relative;
  width: 100%;
  padding-bottom: 76px;
  overflow: hidden;
  border: 1px solid var(--ab-line);
  border-radius: var(--k-r);
  background: var(--ab-canvas);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-fabbox > :is(.sb-k-fab, .sb-k-backtop) {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-cta.sb-k-fab {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  cursor: pointer;
  min-width: 0px !important;
  min-height: 0px !important;
  padding: 0px !important;
}

:where(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-fab, .sb-k-split-more):focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: var(--sb-focus-offset, 2px);
}

.sb-k-link {
  color: var(--k-pri-text, var(--ab-primary-text, var(--ab-ink)));
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-link.sb-k-pressed {
  box-shadow: none;
  color: var(--k-muted);
}

.sb-k-link:focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: 2px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field .ab-fieldlabel,
:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-selectwrap .ab-fieldlabel {
  margin: 0px 0px 8px !important;
  font-size: var(--k-footnote, 13px) !important;
  line-height: var(--k-footnote-lh, 18px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-field, .sb-k-search, .sb-k-selectwrap) .ab-input {
  min-height: 0px;
  line-height: normal;
  height: var(--k-field, 48px) !important;
  margin: 0px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: var(--k-body, 17px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field.is-focus .ab-input,
:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-search.is-focus .ab-input {
  border-color: var(--k-pri-text, var(--ab-primary-text)) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ab-primary) 24%, transparent) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field.is-error .ab-input {
  border-color: var(--sb-danger) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sb-danger) 18%, transparent) !important;
}

[data-sb-danger="ink"][data-k-field="box"].sb-kit .sb-k-field.is-error .ab-input {
  border-width: 2px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-field .ab-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sb-k-help {
  font-family: var(--ab-font-b);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  color: var(--k-muted);
  margin: 6px 0px 0px !important;
}

.sb-k-help.is-error {
  color: var(--sb-danger-text, var(--sb-danger));
}

.sb-k-search {
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-search .ab-input {
  padding-left: 44px !important;
}

.sb-k-search > .sb-ico {
  left: 14px;
}

.sb-k-selectwrap {
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-input.sb-k-select {
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex !important;
}

.sb-k-menu {
  list-style: none;
  padding: 6px;
  border: 1px solid var(--ab-line);
  border-radius: var(--k-r);
  background: var(--ab-canvas);
  color: var(--ab-ink);
  box-shadow: rgba(0, 0, 0, 0.04) 0px 1px 2px, rgba(0, 0, 0, 0.16) 0px 10px 24px -10px;
  margin: 6px 0px 0px !important;
}

.sb-k-menu li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: var(--k-tap, 44px);
  padding: 0px 12px;
  border-radius: max(calc(var(--k-r) - 4px), 0px);
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
}

.sb-k-menu li[aria-selected="true"] {
  background: var(--ab-pri-tint);
  font-weight: 600;
}

.sb-k-menu .sb-ico {
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

.sb-k-check {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--k-tap, 44px);
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
  line-height: var(--k-body-lh, 24px);
  cursor: pointer;
}

.sb-k-box {
  appearance: none;
  position: relative;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin: 0px;
  cursor: pointer;
  border: 1.5px solid color-mix(in srgb, var(--ab-ink) 72%, transparent);
  border-radius: min(var(--sb-r, 6px), 7px);
  background: transparent;
}

.sb-k-box[type="radio"] {
  border-radius: 50%;
}

.sb-k-box:checked {
  background: var(--ab-primary);
  border-color: var(--ab-primary);
}

.sb-k-box[type="checkbox"]:checked::after {
  content: "";
  width: 12px;
  height: 6px;
  border-left: 2.5px solid var(--ab-on-primary);
  border-bottom: 2.5px solid var(--ab-on-primary);
  transform: translateY(-2px) rotate(-45deg);
}

.sb-k-box[type="radio"]:checked::after {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ab-on-primary);
}

.sb-k-box:focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: var(--sb-focus-offset, 2px);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-toggle.sb-tog {
  width: 100%;
  line-height: var(--k-body-lh, 24px);
  font-size: var(--k-body, 17px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-seg {
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-seg-btn {
  white-space: nowrap;
  min-height: var(--k-tap, 44px) !important;
  font-size: var(--k-subhead, 15px) !important;
  line-height: var(--k-subhead-lh, 20px) !important;
}

.sb-k-slider,
.sb-k-progress {
  width: 100%;
}

.sb-k-slider-h {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-slider-h span:last-child {
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range {
  appearance: none;
  display: block;
  width: 100%;
  height: 28px;
  margin: 0px;
  background: transparent;
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--ab-primary) var(--v, 50%), color-mix(in srgb, var(--ab-ink) 16%, transparent) var(--v, 50%));
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range::-webkit-slider-thumb {
  appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -12px;
  border-radius: 50%;
  background: var(--ab-canvas);
  border: 1px solid color-mix(in srgb, var(--ab-ink) 14%, transparent);
  box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 2px, rgba(0, 0, 0, 0.16) 0px 3px 8px -2px;
  transform: none;
}

:is(.ab.sb-ab, .sb-gen) input[type="range"].sb-k-range:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 4px;
}

.sb-k-icons {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
}

.sb-k-icon {
  display: grid;
  justify-items: center;
  gap: 6px;
  color: var(--ab-ink);
  font-family: var(--ab-font-ui);
  font-size: var(--k-caption, 12px);
  line-height: var(--k-caption-lh, 16px);
}

.sb-k-icon > span {
  color: var(--k-muted);
  white-space: nowrap;
}

.sb-k-combo {
  width: 100%;
}

.sb-k-match {
  background: none;
  color: inherit;
  font-weight: 700;
}

.sb-k-listbox {
  width: 100%;
  box-shadow: none;
  margin: 0px !important;
}

.sb-k-listbox li > span {
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-listbox .sb-k-box {
  pointer-events: none;
}

.sb-k-stepwrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
  line-height: var(--k-body-lh, 24px);
}

.sb-k-stepper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sb-k-step-val {
  min-width: 36px;
  text-align: center;
  font-size: var(--k-body, 17px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sb-k-knobwrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sb-k-knob {
  position: relative;
  flex: 0 0 auto;
  width: 72px;
  height: 72px;
}

.sb-k-knob-arc {
  position: absolute;
  inset: 0px;
  border-radius: 50%;
  background: conic-gradient(from -135deg, var(--ab-primary) calc(var(--v) * 270deg), color-mix(in srgb, var(--ab-ink) 16%, transparent) 0deg 270deg, transparent 0deg);
  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), rgb(0, 0, 0) calc(100% - 5px));
}

.sb-k-knob-dial {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: var(--ab-canvas);
  border: 1px solid color-mix(in srgb, var(--ab-ink) 14%, transparent);
  box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 2px, rgba(0, 0, 0, 0.16) 0px 3px 8px -2px;
  transform: rotate(calc(-135deg + var(--v) * 270deg));
}

.sb-k-knob-ind {
  position: absolute;
  left: 50%;
  top: 5px;
  width: 3px;
  height: 10px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: var(--ab-ink);
}

.sb-k-knob-txt {
  display: grid;
  gap: 2px;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-knob-val {
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
}

.sb-k-datefield {
  position: relative;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-datefield .ab-input {
  padding-right: 46px !important;
  cursor: pointer;
}

.sb-k-date-ico {
  position: absolute;
  right: 14px;
  top: calc(var(--k-footnote-lh, 18px) + 8px + (var(--k-field, 48px) - 20px) / 2);
  display: grid;
  color: var(--k-muted);
  pointer-events: none;
}

.sb-k-cal {
  width: 100%;
  padding: 8px 8px 12px;
  border: 1px solid var(--ab-line);
  border-radius: var(--k-r);
  background: var(--ab-canvas);
  color: var(--ab-ink);
  font-family: var(--ab-font-ui);
}

.sb-k-cal-head {
  display: grid;
  grid-template-columns: var(--k-tap, 44px) minmax(0, 1fr) var(--k-tap, 44px);
  align-items: center;
}

.sb-k-cal-t {
  text-align: center;
  font-size: var(--k-headline, 17px);
  line-height: var(--k-headline-lh, 22px);
  font-weight: 600;
}

.sb-k-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0px, 1fr));
}

.sb-k-cal-dow {
  display: grid;
  place-items: center;
  height: 28px;
  font-size: var(--k-caption, 12px);
  line-height: var(--k-caption-lh, 16px);
  font-weight: 600;
  color: var(--k-muted);
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
}

.sb-k-day {
  height: var(--k-tap, 44px);
  padding: 0px;
  border: 0px;
  border-radius: min(var(--sb-r, 12px), 22px);
  background: none;
  color: var(--ab-ink);
  font-style: inherit;
  font-variant-ligatures: inherit;
  font-variant-caps: inherit;
  font-variant-east-asian: inherit;
  font-variant-alternates: inherit;
  font-variant-position: inherit;
  font-variant-emoji: inherit;
  font-weight: inherit;
  font-stretch: inherit;
  line-height: inherit;
  font-family: inherit;
  font-optical-sizing: inherit;
  font-size-adjust: inherit;
  font-kerning: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  font-language-override: inherit;
  font-size: var(--k-subhead, 15px);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.sb-k-day.is-out {
  color: var(--k-muted);
}

.sb-k-day.is-today {
  box-shadow: inset 0 0 0 1.5px var(--ab-ink);
}

.sb-k-day.is-range {
  border-radius: 0px;
  background: var(--ab-pri-tint);
  box-shadow: none;
}

.sb-k-day.is-sel {
  background: var(--ab-primary);
  color: var(--ab-on-primary);
  font-weight: 600;
  box-shadow: none;
}

.sb-k-day.is-start {
  border-radius: min(var(--sb-r, 12px), 22px) 0 0 min(var(--sb-r, 12px), 22px);
}

.sb-k-day.is-end {
  border-radius: 0 min(var(--sb-r, 12px), 22px) min(var(--sb-r, 12px), 22px) 0;
}

.sb-k-day:focus-visible {
  outline: var(--sb-focus-w, 2px) solid var(--sb-focus, var(--sb-focus-auto, var(--ab-ink)));
  outline-offset: -2px;
}

.sb-k-wheel {
  --wr: 40px;
  position: relative;
  display: flex;
  width: 100%;
  max-width: 420px;
  height: calc(var(--wr) * 5);
  overflow: hidden;
  border-radius: var(--k-r);
  background: var(--ab-canvas);
}

.sb-k-wheel-col {
  position: relative;
  z-index: 1;
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-wheel-item {
  display: grid;
  place-items: center;
  height: var(--wr);
  font-family: var(--ab-font-ui);
  font-size: var(--k-body, 17px);
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
}

.sb-k-wheel-item.is-d2 {
  font-size: var(--k-subhead, 15px);
}

.sb-k-wheel-item.is-sel {
  color: var(--ab-ink);
  font-weight: 600;
  font-size: var(--k-title-2, 22px);
}

.sb-k-wheel-band {
  position: absolute;
  left: 6px;
  right: 6px;
  z-index: 0;
  top: calc(var(--wr) * 2);
  height: var(--wr);
  border-radius: min(var(--k-r), 12px);
  background: color-mix(in srgb, var(--ab-ink) 8%, transparent);
  pointer-events: none;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-card {
  display: block;
  width: 100%;
  margin: 0px;
  padding-left: var(--k-cardpad, 20px) !important;
  padding-right: var(--k-cardpad, 20px) !important;
  padding-bottom: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-card .ab-seg {
  margin: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-card .ab-card-title {
  margin: 16px 0px 6px !important;
  font-size: var(--k-title-2, 22px) !important;
  line-height: var(--k-title-2-lh, 28px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-card .ab-card-body {
  margin: 0px 0px 20px !important;
  font-size: var(--k-subhead, 15px) !important;
  line-height: var(--k-subhead-lh, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-labelrow.sb-k-section {
  align-items: center;
  min-height: 32px;
  margin: 0px 0px 8px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-textbtn.sb-k-see {
  margin: -6px 0px;
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-chev {
  display: inline-flex;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-section .ab-label {
  font-size: var(--k-footnote, 13px) !important;
  line-height: var(--k-footnote-lh, 18px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-list.sb-k-list {
  width: 100%;
  margin: 0px;
  padding: 0px;
  list-style: none;
  display: block !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row.sb-k-row {
  align-items: center;
  display: grid !important;
  grid-template-columns: auto minmax(0px, 1fr) auto !important;
  grid-template-rows: auto !important;
  gap: 0px 14px !important;
  min-height: var(--k-row, 52px) !important;
  height: auto !important;
  padding: 8px 16px !important;
  aspect-ratio: auto !important;
  font-size: var(--k-body, 17px) !important;
  line-height: var(--k-body-lh, 24px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-row > * {
  grid-area: 1 !important;
  position: static !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-list.is-open > .ab-row.sb-k-row {
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.sb-k-lead {
  display: grid;
  place-items: center;
}

.sb-k-ico {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: min(var(--sb-r, 8px), 10px);
  background: var(--ab-pri-tint);
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

.sb-k-text {
  display: grid;
  min-width: 0px;
}

.sb-k-title {
  min-width: 0px;
  font-weight: 500;
  overflow-wrap: normal;
}

.sb-k-sub {
  font-family: var(--ab-font-b);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  color: var(--k-muted);
}

.sb-k-trail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--k-subhead, 15px);
  color: var(--k-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.sb-k-callout {
  --tone: var(--k-info, var(--ab-primary));
  --tone-ico: var(--k-info-ico, var(--ab-primary-text));
  display: grid;
  grid-template-columns: auto minmax(0px, 1fr);
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: var(--k-callout-edge-w, 1px) solid var(--tone-ico);
  border-radius: var(--k-callout-r, min(var(--sb-card-r, var(--k-r)), 16px));
  background: color-mix(in srgb, var(--tone) var(--k-callout-fill, 12%), var(--ab-canvas));
  color: var(--ab-ink);
  box-shadow: var(--k-callout-shadow, none);
  font-family: var(--ab-font-b);
  font-size: var(--k-callout, 16px);
  line-height: var(--k-callout-lh, 22px);
}

.sb-k-callout[data-tone="success"] {
  --tone: var(--k-ok, var(--ab-secondary));
  --tone-ico: var(--k-ok-ico, var(--k-ok, var(--ab-ink)));
}

.sb-k-callout[data-tone="warning"] {
  --tone: var(--k-warn, var(--ab-accent));
  --tone-ico: var(--k-warn-ico, var(--k-warn, var(--ab-ink)));
}

.sb-k-callout[data-tone="error"] {
  --tone: var(--k-err, var(--sb-danger));
  --tone-ico: var(--k-err-ico, var(--sb-danger-text, var(--sb-danger)));
}

[data-sb-danger="ink"] .sb-k-callout[data-tone="error"] {
  border: 2px solid var(--ab-ink);
  background: var(--ab-canvas);
}

.sb-k-callout > .sb-ico {
  margin-top: 1px;
  color: var(--tone-ico);
}

.sb-k-callout b {
  display: block;
  font-family: var(--ab-font-ui);
  font-weight: 600;
}

.sb-k-sheetbox {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  min-height: 300px;
  border-radius: var(--k-r);
  overflow: hidden;
  background: color-mix(in srgb, var(--ab-ink) 6%, var(--ab-canvas));
}

.sb-k-sheetbox::before {
  content: "";
  position: absolute;
  inset: 0px;
  background: rgba(0, 0, 0, 0.38);
}

.sb-k-sheet {
  position: relative;
  display: grid;
  gap: 10px;
  padding: 10px var(--k-margin, 20px) var(--k-margin, 20px);
  border-radius: var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) 0 0;
  background: var(--ab-canvas);
  color: var(--ab-ink);
  box-shadow: var(--k-sheet-shadow, 0 -1px 2px rgba(0, 0, 0, 0.04), 0 -8px 24px -8px rgba(0, 0, 0, 0.14));
}

.sb-k-grab {
  justify-self: center;
  width: 36px;
  height: 5px;
  border-radius: 3px;
  background: var(--ab-line);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card-title.sb-k-sheet-t {
  margin: 6px 0px 0px !important;
  font-size: var(--k-title-2, 22px) !important;
  line-height: var(--k-title-2-lh, 28px) !important;
}

.sb-k-sheet-b,
.sb-k-para {
  font-family: var(--ab-font-b);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
  color: var(--k-muted);
  margin: 0px !important;
}

.sb-k-sheet-a {
  display: grid;
  gap: 10px;
  margin-top: 8px;
}

.sb-k-divider {
  display: grid;
  gap: 12px;
  width: 100%;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-divider .ab-labelrow {
  margin: 0px !important;
}

.sb-k-ph {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: min(var(--sb-card-r, var(--k-r)), 12px);
  background: color-mix(in srgb, var(--ab-ink) 8%, var(--ab-canvas));
  color: var(--k-muted);
}

.sb-k-acc > summary {
  list-style: none;
  cursor: pointer;
}

.sb-k-acc > summary::-webkit-details-marker {
  display: none;
}

.sb-k-acc[open] .sb-k-acc-chev {
  transform: rotate(180deg);
}

.sb-k-acc-sum:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: -2px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-acc-body {
  font-family: var(--ab-font-b);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
  color: var(--k-muted);
  margin: 0px !important;
  padding: 4px 16px 16px !important;
}

.sb-k-carousel,
.sb-k-matrix {
  width: 100%;
  min-width: 0px;
}

.sb-k-car-track,
.sb-k-mx-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.sb-k-car-track::-webkit-scrollbar,
.sb-k-mx-track::-webkit-scrollbar {
  display: none;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-car-card {
  flex: 0 0 min(72%, 240px);
  width: auto;
  scroll-snap-align: start;
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-car-card .ab-card-body {
  margin-bottom: 0px !important;
}

.sb-k-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 12px 0px 0px;
}

.sb-k-dots i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--ab-ink) 30%, var(--ab-canvas));
}

.sb-k-dots i.is-on {
  background: var(--k-pri-text, var(--ab-primary-text));
}

.sb-k-matrix {
  display: grid;
  gap: 8px;
}

.sb-k-mx-row {
  min-width: 0px;
}

.sb-k-mx-tile {
  flex: 0 0 112px;
  display: grid;
  align-content: start;
  gap: 8px;
  scroll-snap-align: start;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-mx-tile .sb-k-ph {
  aspect-ratio: 1 / 1;
}

.sb-k-under {
  position: absolute;
  inset: 0px;
  z-index: 0;
  overflow: hidden;
  padding: 12px;
  background: var(--ab-canvas);
}

.sb-k-overlaybox {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 240px;
  overflow: hidden;
  border-radius: var(--k-r);
  background: var(--ab-canvas);
}

.sb-k-scrim {
  position: absolute;
  inset: 0px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.38);
}

.sb-k-overlaybox > .sb-k-scrimnote {
  position: relative;
  z-index: 2;
  width: auto;
  padding: 0px 16px;
}

.sb-k-sheetbox.is-under::before {
  z-index: 1;
}

.sb-k-sheetbox.is-under > :not(.sb-k-under) {
  position: relative;
  z-index: 2;
}

.sb-k-dialogbox {
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.sb-k-sidebox,
.sb-k-drawerbox {
  flex-direction: row;
  align-items: stretch;
  min-height: 380px;
}

.sb-k-sidebox {
  justify-content: flex-end;
}

.sb-k-drawerbox {
  justify-content: flex-start;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-dialog {
  width: 100%;
  max-width: 340px;
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-dialog .ab-card-title.sb-k-dialog-t {
  margin: 0px 0px 6px !important;
}

.sb-k-dialog-a {
  display: grid;
  grid-template-columns: repeat(2, minmax(0px, 1fr));
  gap: 10px;
}

.sb-k-side,
.sb-k-drawer {
  display: grid;
  align-content: start;
  gap: 8px;
  width: min(80%, 300px);
  padding: 8px 16px 16px;
  background: var(--ab-canvas);
  color: var(--ab-ink);
}

.sb-k-side {
  border-left: 1px solid var(--ab-line);
  border-radius: var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) 0 0 var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px));
  box-shadow: rgba(0, 0, 0, 0.14) -8px 0px 24px -8px;
}

.sb-k-drawer {
  padding: 12px 8px;
  border-right: 1px solid var(--ab-line);
  border-radius: 0 var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) var(--k-sheet-r, min(var(--sb-card-r, var(--k-r)), 24px)) 0;
  box-shadow: rgba(0, 0, 0, 0.14) 8px 0px 24px -8px;
}

.sb-k-drawer .sb-k-tb-brand {
  justify-self: start;
  padding: 4px 12px 8px;
}

.sb-k-side-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-right: -12px;
}

.sb-k-popbox {
  position: relative;
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border-radius: var(--k-r);
  background: color-mix(in srgb, var(--ab-ink) 4%, var(--ab-canvas));
}

.sb-k-popbox.is-end {
  justify-items: end;
}

.sb-k-popbox.is-tooltip {
  justify-items: center;
  gap: 0px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card.sb-k-pop {
  position: relative;
  width: min(100%, 280px);
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pop .ab-card-title {
  margin: 0px 0px 6px !important;
  font-size: var(--k-headline, 17px) !important;
  line-height: var(--k-headline-lh, 22px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pop .ab-card-body {
  margin: 0px 0px 8px !important;
}

.sb-k-pop-arrow {
  z-index: 2;
  box-sizing: border-box;
  top: -11px;
  left: 24px;
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  margin: 0px;
  padding: 0px;
  border-style: inherit;
  border-color: inherit;
  border-width: var(--k-arrow-edge, 1px) 0 0 var(--k-arrow-edge, 1px);
  background: inherit;
  transform: rotate(45deg);
  position: absolute !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-k-pop, .sb-k-tip, .sb-k-tooltip) {
  overflow: visible !important;
}

.sb-k-popbox.is-end .sb-k-pop-arrow {
  left: auto;
  right: 16px;
}

.sb-k-popbox > .sb-k-tooltip {
  position: relative;
  order: -1;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: min(var(--sb-r, 8px), 10px);
  background: var(--ab-ink);
  color: var(--ab-canvas);
  font-family: var(--ab-font-ui);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  white-space: nowrap;
}

.sb-k-pop-arrow.is-down {
  top: auto;
  bottom: -11px;
  left: 50%;
  margin-left: -7px;
  border-width: 0 var(--k-arrow-edge, 1px) var(--k-arrow-edge, 1px) 0;
}

.sb-k-lightbox {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 340px;
  padding: 56px 56px 48px;
  border-radius: var(--k-r);
  background: color-mix(in srgb, var(--ab-ink) 92%, var(--ab-canvas));
  color: var(--ab-canvas);
}

.sb-k-lb-img {
  max-width: 420px;
  background: color-mix(in srgb, var(--ab-canvas) 14%, var(--ab-ink));
  color: var(--ab-canvas);
}

.sb-k-lightbox .sb-k-plain {
  position: absolute;
  color: var(--ab-canvas);
}

.sb-k-lb-close {
  top: 4px;
  right: 4px;
}

.sb-k-lb-prev {
  left: 4px;
  top: 50%;
  margin-top: calc(var(--k-tap, 44px) / -2);
}

.sb-k-lb-next {
  right: 4px;
  top: 50%;
  margin-top: calc(var(--k-tap, 44px) / -2);
}

.sb-k-lb-cap {
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: 14px;
  text-align: center;
  font-family: var(--ab-font-ui);
  font-size: var(--k-footnote, 13px);
  line-height: var(--k-footnote-lh, 18px);
  margin: 0px !important;
}

.sb-k-topbar {
  display: grid;
  grid-template-columns: var(--k-tap, 44px) minmax(0, 1fr) var(--k-tap, 44px);
  align-items: center;
  width: 100%;
  min-height: 44px;
  border-bottom: 1px solid var(--ab-line);
}

.sb-k-tb-title {
  text-align: center;
  font-family: var(--ab-font-ui);
  font-size: var(--k-headline, 17px);
  line-height: var(--k-headline-lh, 22px);
  font-weight: 600;
}

.sb-k-tabbarbox {
  width: 100%;
  overflow: hidden;
  border-radius: var(--k-r);
  border: 1px solid var(--ab-line);
}

.sb-k-tabbarbox .sb-tabs {
  margin: 0px;
  height: auto;
  padding-bottom: 14px;
  border-top: 0px;
}

.sb-k-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0px 24px;
  width: 100%;
  border-bottom: 1px solid var(--ab-line);
}

.sb-k-tabs [role="tab"] {
  position: relative;
  min-height: var(--k-tap, 44px);
  padding: 0px;
  border: 0px;
  background: none;
  cursor: pointer;
  font-family: var(--k-ui);
  font-size: var(--k-subhead, 15px);
  color: var(--k-muted);
  text-transform: var(--sb-ui-tt, none);
  letter-spacing: var(--sb-ui-ls, 0);
  white-space: nowrap;
}

.sb-k-tabs [role="tab"][aria-selected="true"] {
  color: var(--ab-ink);
  font-weight: 600;
}

.sb-k-tabs [role="tab"][aria-selected="true"]::after {
  content: "";
  position: absolute;
  left: 0px;
  right: 0px;
  bottom: -1px;
  height: 2px;
  background: var(--ab-primary);
}

.sb-k-tabs [role="tab"]:focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 2px;
}

.sb-k-nm-item {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-nm-children :is(.ab-row.sb-k-row, .ab-row.sb-k-row.is-picked) {
  padding-left: 62px !important;
}

.sb-k-scroll {
  display: grid;
  grid-template-columns: minmax(0px, 1fr) 12px;
  gap: 8px;
  width: 100%;
  height: 168px;
}

.sb-k-scrollbox {
  min-width: 0px;
  overflow: hidden;
}

.sb-k-sbar {
  position: relative;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ab-ink) 8%, transparent);
}

.sb-k-sbar-thumb {
  position: absolute;
  left: 2px;
  right: 2px;
  top: var(--t);
  height: var(--h);
  border-radius: 999px;
  background: color-mix(in srgb, var(--ab-ink) 45%, transparent);
}

.sb-k-cmdmenu {
  width: min(100%, 240px);
}

.sb-k-cmdmenu li {
  gap: 10px;
}

.sb-k-cmdmenu li > span:not(.sb-k-kbd) {
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-cmdmenu .sb-ico {
  flex: 0 0 auto;
  color: var(--k-muted);
}

.sb-k-cmdmenu li[aria-selected="true"] .sb-ico {
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

.sb-k-cmdmenu li.is-danger,
.sb-k-cmdmenu li.is-danger .sb-ico {
  color: var(--sb-danger-text, var(--sb-danger));
}

.sb-k-cmdmenu li.sb-k-menu-sep {
  min-height: 0px;
  height: 1px;
  margin: 4px 8px;
  padding: 0px;
  background: var(--ab-line);
}

.sb-k-ddwrap {
  width: 100%;
}

.sb-k-ctxbox {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border-radius: var(--k-r);
  background: color-mix(in srgb, var(--ab-ink) 4%, var(--ab-canvas));
}

.sb-k-ctxbox > .sb-k-cmdmenu.sb-k-ctx {
  margin: 0px 0px 0px 56px !important;
}

.sb-k-subwrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
  width: 100%;
}

.sb-k-subwrap > .sb-k-cmdmenu {
  width: min(100%, 220px);
  margin: 0px !important;
}

.sb-k-subwrap > .sb-k-cmdmenu + .sb-k-cmdmenu {
  margin-top: var(--k-tap, 44px) !important;
}

.sb-k-piebox {
  display: grid;
  place-items: center;
  width: 100%;
}

.sb-k-pie {
  --pr: 76px;
  position: relative;
  width: 100%;
  max-width: 224px;
  aspect-ratio: 1 / 1;
}

.sb-k-pie::before {
  content: "";
  position: absolute;
  inset: calc(50% - var(--pr));
  border: 1px solid var(--ab-line);
  border-radius: 50%;
  background: color-mix(in srgb, var(--ab-ink) 3%, transparent);
}

.sb-k-pie-hub {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 14px;
  height: 14px;
  margin: -7px 0px 0px -7px;
  border-radius: 50%;
  background: var(--ab-primary);
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-pie > .sb-k-pie-item {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.sb-k-row-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.sb-k-badge,
.sb-k-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  min-width: 22px;
  padding: 0px 8px;
  border-radius: 999px;
  font-family: var(--k-ui);
  font-size: var(--k-caption, 12px);
  line-height: var(--k-caption-lh, 16px);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sb-k-badge,
.sb-k-count.is-accent {
  background: var(--ab-accent);
  color: var(--ab-on-accent);
}

.sb-k-count {
  background: color-mix(in srgb, var(--ab-ink) 10%, transparent);
  color: var(--ab-ink);
}

.sb-k-dotwrap {
  position: relative;
  display: grid;
  place-items: center;
  width: var(--k-tap, 44px);
  height: var(--k-tap, 44px);
  color: var(--ab-ink);
}

.sb-k-dotwrap .sb-badge {
  top: 9px;
  right: 10px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row-bar.sb-k-bar {
  width: 100%;
  display: block !important;
  height: 8px !important;
}

.sb-k-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: var(--k-btn, 52px);
  padding: 0px 6px 0px 16px;
  border-radius: min(var(--sb-r, 12px), 14px);
  background: var(--ab-ink);
  color: var(--ab-canvas);
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px, rgba(0, 0, 0, 0.2) 0px 8px 20px -8px;
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-toast > span {
  flex: 1 1 0%;
  min-width: 0px;
}

.sb-k-toast button {
  min-height: var(--k-tap, 44px);
  padding: 0px 12px;
  border: 0px;
  background: none;
  color: inherit;
  font: 600 var(--k-subhead, 15px)/1 var(--k-ui);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.sb-k-empty {
  display: grid;
  justify-items: center;
  gap: 10px;
  width: 100%;
  padding: 20px 12px;
  text-align: center;
}

.sb-k-emptyico {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ab-pri-tint);
  color: var(--k-pri-on-tint, var(--ab-primary-text));
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card-title.sb-k-empty-t {
  margin: 4px 0px 0px !important;
  font-size: var(--k-title-2, 22px) !important;
  line-height: var(--k-title-2-lh, 28px) !important;
}

.sb-k-empty-b {
  max-width: 28ch;
  font-family: var(--ab-font-b);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
  color: var(--k-muted);
  margin: 0px 0px 6px !important;
}

.sb-k-av {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ab-secondary);
  color: var(--ab-on-secondary);
  font: 600 15px/1 var(--k-ui);
  letter-spacing: 0px;
  text-transform: uppercase;
}

.sb-k-av-s {
  width: 32px;
  height: 32px;
  font-size: 13px;
}

.sb-k-av-l {
  width: 56px;
  height: 56px;
  font-size: 20px;
}

.sb-k-avs {
  display: inline-flex;
  padding-left: 4px;
}

.sb-k-avs .sb-k-av {
  margin-left: -4px;
  box-shadow: 0 0 0 2px var(--ab-canvas) !important;
}

.sb-k-spinner {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--k-muted);
  font-family: var(--ab-font-ui);
  font-size: var(--k-subhead, 15px);
  line-height: var(--k-subhead-lh, 20px);
}

.sb-k-spin {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-top-style:;
  border-top-width:;
  border-right-color:;
  border-right-style:;
  border-right-width:;
  border-bottom-color:;
  border-bottom-style:;
  border-bottom-width:;
  border-left-color:;
  border-left-style:;
  border-left-width:;
  border-image-source:;
  border-image-slice:;
  border-image-width:;
  border-image-outset:;
  border-image-repeat:;
  border-top-color: var(--ab-primary);
  border-radius: 50%;
}

.sb-k-skel {
  display: grid;
  gap: 14px;
  width: 100%;
}

.sb-k-skel-row {
  display: grid;
  grid-template-columns: auto minmax(0px, 1fr);
  gap: 14px;
  align-items: center;
}

.sb-k-skel-row > span {
  display: grid;
  gap: 8px;
}

.sb-k-skel-av,
.sb-k-skel-line,
.sb-k-skel-block {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: min(var(--sb-r, 6px), 8px);
  background-color: color-mix(in srgb, var(--ab-ink) 8%, var(--ab-canvas));
}

.sb-k-skel-av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.sb-k-skel-line {
  height: 12px;
}

.sb-k-skel-line.is-l1 {
  width: 62%;
  height: 14px;
}

.sb-k-skel-line.is-l2 {
  width: 38%;
}

.sb-k-skel-block {
  height: 96px;
  border-radius: min(var(--sb-card-r, var(--k-r)), 12px);
}

@media (prefers-reduced-motion: no-preference) {
  .sb-k-spin {
    animation: 0.9s linear 0s infinite normal none running sb-k-spin;
  }

  .sb-k-skel-av::after,
  .sb-k-skel-line::after,
  .sb-k-skel-block::after {
    content: "";
    position: absolute;
    inset: 0px;
    background: linear-gradient(90deg, transparent 33%, color-mix(in srgb, var(--ab-canvas) 55%, transparent) 50%, transparent 67%) 0 0 / 300% 100% no-repeat;
    animation: 1.4s ease-in-out 0s infinite normal none running sb-k-shimmer;
  }
}

@keyframes sb-k-spin { 
  100% { transform: rotate(360deg); }
}

@keyframes sb-k-shimmer { 
  0% { background-position: 100% 0px; }
  100% { background-position: 0px 0px; }
}

.sb-k-spec {
  display: flex;
  align-items: center;
  min-width: 0px;
}

.sb-k-scr {
  position: relative;
  width: 390px;
  height: 844px;
  border-radius: 54px;
  overflow: hidden;
  container: ab / inline-size;
  background: var(--ab-canvas);
  color: var(--ab-ink);
  text-align: left;
}

.sb-k-scr-in {
  padding-bottom: 34px;
}

.sb-k-scr[data-scr="list"] .sb-k-scr-in {
  padding-bottom: 0px;
}

.sb-k-blk {
  flex-shrink: 0;
  min-width: 0px;
}

.sb-k-blk + .sb-k-blk {
  margin-top: 16px;
}

.sb-k-blk[data-blk="topbar"] + .sb-k-blk {
  margin-top: 12px;
}

.sb-k-blk[data-blk="section"] {
  margin-top: var(--k-gap, 28px);
}

.sb-k-blk[data-blk="section"] + .sb-k-blk {
  margin-top: 0px;
}

.sb-k-blk[data-blk="title"] + .sb-k-blk[data-blk="body"] {
  margin-top: 12px;
}

.sb-k-blk[data-blk="btn-primary"] + .sb-k-blk[data-blk="btn-text"] {
  margin-top: 8px;
  display: grid;
  justify-items: center;
}

.sb-k-blk[data-blk="toggle"] {
  margin-top: 0px;
  padding: 4px 0px;
  border-bottom: 1px solid var(--ab-line);
}

.sb-k-scr[data-scr="form"] .sb-k-blk[data-blk="toggle"] {
  margin-top: 16px;
}

.sb-k-scr[data-scr="onboarding"] .sb-k-blk[data-blk="title"] {
  margin-top: auto;
}

.sb-k-scr[data-scr="onboarding"] .sb-k-blk[data-blk="list"] {
  margin-top: var(--k-gap, 28px);
  margin-bottom: auto;
}

.sb-k-scr[data-scr="onboarding"] .sb-k-blk[data-blk="btn-primary"],
.sb-k-scr[data-scr="form"] .sb-k-blk[data-blk="btn-primary"] {
  margin-top: auto;
  padding-top: 16px;
}

.sb-k-scr[data-scr="settings"] .sb-k-blk[data-blk="btn-destructive"] {
  margin-top: var(--k-gap, 28px);
}

.sb-k-blk.sb-k-fill {
  flex: 1 1 auto;
  min-height: 0px;
  overflow: hidden;
  padding-bottom: 12px;
}

.sb-k-blk.sb-k-fill + .sb-k-blk {
  margin-top: 0px;
}

.sb-k-blk[data-blk="tabbar"] {
  margin: auto calc(-1 * var(--k-margin, 20px)) 0 !important;
}

.sb-k-blk[data-blk="tabbar"] .sb-tabs {
  margin: 0px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-card-title.sb-k-ltitle {
  overflow-wrap: normal;
  text-wrap: balance;
  margin: 0px !important;
  font-size: var(--k-large-title, 34px) !important;
  line-height: var(--k-large-title-lh, 41px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-scr .ab-card.sb-k-card .ab-card-title {
  margin-top: 0px !important;
  font-size: var(--k-title, 28px) !important;
  line-height: var(--k-title-lh, 34px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-scr .ab-card.sb-k-card {
  padding-top: var(--k-cardpad, 20px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-scr .sb-k-card .ab-card-body {
  margin-bottom: 0px !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-tb-brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0px;
  max-width: 100%;
  line-height: var(--k-headline-lh, 22px);
  font-size: var(--k-headline, 17px) !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .sb-k-tb-brand .ab-mark {
  width: 28px;
  height: 28px;
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-row.sb-k-row.is-nolead {
  grid-template-columns: minmax(0px, 1fr) auto !important;
}

@container ab (max-width: 760px) {
  .sb-search {
    flex: 1 1 140px;
    width: auto;
  }
}

:is(.ab.sb-ab, .sb-gen).sb-kit .ab-subcopy.sb-ob-body {
  display: block !important;
}

:is(.ab.sb-ab, .sb-gen).sb-kit :is(.sb-ob-h, .sb-k-ltitle, .sb-home-h) .ab-hl {
  -webkit-box-decoration-break: slice !important;
  box-decoration-break: slice !important;
  padding-left: 0px !important;
  padding-right: 0px !important;
}

/* ===== inline <style> ===== */
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit {
  --ab-primary-text: var(--ab-ink) !important;
  --ab-pri-tint: color-mix(in srgb, var(--ab-ink) 4%, var(--ab-canvas)) !important;
  --ab-accent: var(--ab-ink) !important;
  --ab-on-accent: var(--ab-canvas) !important;
}

.ab[data-ae="youch-voice-line"] .ab-cta,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-cta,
.ab[data-ae="youch-voice-line"] .ab-cta.sb-k-btn,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-cta.sb-k-btn,
.ab[data-ae="youch-voice-line"] .ab-type-apply,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-type-apply,
.ab[data-ae="youch-voice-line"] .ab-type-apply.sb-k-btn2,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-type-apply.sb-k-btn2,
.ab[data-ae="youch-voice-line"] .sb-k-textbtn,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-textbtn,
.ab[data-ae="youch-voice-line"] .sb-k-danger,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-danger,
.ab[data-ae="youch-voice-line"] .ab-input,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-input,
.ab[data-ae="youch-voice-line"] .sb-k-field .ab-input,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-field .ab-input,
.ab[data-ae="youch-voice-line"] .sb-k-search .ab-input,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-search .ab-input,
.ab[data-ae="youch-voice-line"] .sb-k-select,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-select,
.ab[data-ae="youch-voice-line"] .ab-seg-btn,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-seg-btn {
  border-radius: 6px;
}

.ab[data-ae="youch-voice-line"] .ab-card,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card,
.ab[data-ae="youch-voice-line"] .ab-card.sb-k-card,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card.sb-k-card,
.ab[data-ae="youch-voice-line"] .ab-card.sb-k-dialog,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card.sb-k-dialog,
.ab[data-ae="youch-voice-line"] .sb-k-dialog,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-dialog,
.ab[data-ae="youch-voice-line"] .sb-k-sheet,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-sheet,
.ab[data-ae="youch-voice-line"] .sb-k-toast,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-toast,
.ab[data-ae="youch-voice-line"] .sb-k-menu,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu,
.ab[data-ae="youch-voice-line"] .sb-k-callout,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-callout {
  border-radius: 0px;
}

.ab[data-ae="youch-voice-line"] .sb-k-badge,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-badge,
.ab[data-ae="youch-voice-line"] .sb-k-count,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-count,
.ab[data-ae="youch-voice-line"] .sb-k-tooltip,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-tooltip,
.ab[data-ae="youch-voice-line"] .sb-k-tabs [role="tab"],
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-tabs [role="tab"] {
  border-radius: 6px;
}

.ab[data-ae="youch-voice-line"] .ab-switch,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch,
.ab[data-ae="youch-voice-line"] .ab-row-bar,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-row-bar,
.ab[data-ae="youch-voice-line"] .sb-k-bar,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-bar,
.ab[data-ae="youch-voice-line"] .sb-k-av,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-av {
  border-radius: 999px;
}

.ab[data-ae="youch-voice-line"] .ab-rule {
  height: 0px;
  border-right: 0px;
  border-bottom: 0px;
  border-left: 0px;
  border-image: none;
  border-top: 1px solid var(--ab-line);
  background: none;
}

.ab[data-ae="youch-voice-line"] :is(.sb-k-divider, .sb-k-menu-sep) {
  border-color: var(--ab-line);
}

.ab[data-ae="youch-voice-line"] .ab-row,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-row,
.ab[data-ae="youch-voice-line"] .sb-k-row,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-row {
  border-bottom: 1px solid var(--ab-line);
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit {
  border-radius: 0px;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-rule {
  background: var(--mv-hair);
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-labelrow {
  padding-bottom: 9px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--mv-hair);
  align-items: baseline;
}

.ab[data-ae="youch-voice-line"] .ab-headline {
  font-weight: 600;
  word-spacing: 0em;
}

.ab[data-ae="youch-voice-line"] .ab-brand {
  font-weight: 600;
}

.ab[data-ae="youch-voice-line"] .ab-card-title {
  font-weight: 600;
}

.ab[data-ae="youch-voice-line"] :is(.ab-headline, .ab-hero h1, .ab-hero h2) {
  letter-spacing: -0.045em;
  line-height: 0.92;
}

.ab[data-ae="youch-voice-line"] .ab-label,
.ab[data-ae="youch-voice-line"] .ab-fieldlabel,
.ab[data-ae="youch-voice-line"] .sb-k-tb-title,
.ab[data-ae="youch-voice-line"] .ab-brand {
  text-transform: none !important;
  letter-spacing: 0em !important;
}

.ab[data-ae="youch-voice-line"] .ab-cta,
.ab[data-ae="youch-voice-line"] .ab-seg-btn,
.ab[data-ae="youch-voice-line"] .ab-type-apply,
.ab[data-ae="youch-voice-line"] .sb-k-textbtn,
.ab[data-ae="youch-voice-line"] .sb-k-btn,
.ab[data-ae="youch-voice-line"] .sb-k-btn2,
.ab[data-ae="youch-voice-line"] .sb-k-tabs [role="tab"],
.ab[data-ae="youch-voice-line"] .sb-tab,
.ab[data-ae="youch-voice-line"] .sb-k-link {
  text-transform: none !important;
  letter-spacing: 0em !important;
}

.ab[data-ae="youch-voice-line"] .ab-hl {
  font-style: normal;
  font-weight: 600;
  color: var(--ab-ink);
  background: none;
  padding: 0px;
  margin: 0px;
}

.ab[data-ae="youch-voice-line"][data-accent-text="low"] .ab-hl {
  background-image: none;
  color: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"].sb-kit :is(button, input, a, [tabindex]):focus-visible,
.ab[data-ae="youch-voice-line"] :is(.ab-switch, .ab-cta, .ab-seg-btn, .ab-type-apply):focus-visible {
  outline: 2px solid var(--ab-ink);
  outline-offset: 2px;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-cta-arrow::before {
  content: "";
  font-size: 10px;
}

.ab[data-ae="youch-voice-line"] .ab-cta,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-cta,
.ab[data-ae="youch-voice-line"] .ab-cta.sb-k-btn,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-cta.sb-k-btn {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .ab-cta, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-cta, .ab[data-ae="youch-voice-line"] .ab-cta.sb-k-btn, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-cta.sb-k-btn):is(:active, .sb-k-pressed, .is-pressed) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .ab-type-apply,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-type-apply,
.ab[data-ae="youch-voice-line"] .ab-type-apply.sb-k-btn2,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-type-apply.sb-k-btn2 {
  background: transparent;
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .ab-type-apply, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-type-apply, .ab[data-ae="youch-voice-line"] .ab-type-apply.sb-k-btn2, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-type-apply.sb-k-btn2):is(:active, .sb-k-pressed, .is-pressed) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-textbtn,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-textbtn {
  border-radius: 0px;
  box-shadow: none;
  text-transform: uppercase;
  font-family: var(--ab-font-label);
  font-weight: 600;
  background: none;
  color: var(--ab-ink);
  padding: 4px 0px;
  font-size: 11.5px;
  letter-spacing: 0em;
  border: 0px;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-textbtn {
  box-sizing: border-box;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-top: 0px solid var(--ab-ink);
  border-bottom: 2px solid var(--ab-ink);
  letter-spacing: 0em;
  font-size: 14px !important;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-textbtn, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-textbtn):is(:active, .sb-k-pressed, .is-pressed) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-iconbtn,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-iconbtn {
  background: transparent;
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-iconbtn, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-iconbtn):is(:active, .sb-k-pressed, .is-pressed) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-danger,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-danger {
  background: transparent;
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-danger, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-danger):is(:active, .sb-k-pressed, .is-pressed) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .ab-input,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-input,
.ab[data-ae="youch-voice-line"] .sb-k-field .ab-input,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-field .ab-input,
.ab[data-ae="youch-voice-line"] .sb-k-search .ab-input,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-search .ab-input {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair);
}

.ab[data-ae="youch-voice-line"] .sb-k-select,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-select {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair);
}

.ab[data-ae="youch-voice-line"] .ab-switch,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch {
  width: 40px;
  height: 18px;
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair-strong);
  transition: background 0.15s;
}

.ab[data-ae="youch-voice-line"] .ab-switch::before,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch::before {
  left: 3px;
  top: 3px;
  width: 12px;
  height: 12px;
  border-radius: 0px;
  background: var(--ab-ink);
  transition: transform 0.15s, background 0.15s;
}

:is(.ab[data-ae="youch-voice-line"] .ab-switch, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch):checked {
  background: var(--ab-primary);
  box-shadow: inset 0 0 0 1px var(--ab-primary);
}

.ab[data-ae="youch-voice-line"] .ab-switch:checked::before,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch:checked::before {
  transform: translateX(22px);
  background: var(--ab-on-primary);
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch {
  width: 40px;
  height: 24px;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch::before {
  left: 4px;
  top: 4px;
  width: 16px;
  height: 16px;
}

:is(.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch):checked {
  background: var(--ab-ink);
  box-shadow: inset 0 0 0 1px var(--ab-ink);
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch:checked::before {
  transform: translateX(16px);
  background: var(--ab-canvas);
}

:is(.ab[data-ae="youch-voice-line"] .ab-switch, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-switch):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-box[type="checkbox"],
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-box[type="checkbox"] {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-box[type="checkbox"], .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-box[type="checkbox"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-box[type="radio"],
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-box[type="radio"] {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-box[type="radio"], .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-box[type="radio"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-range,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-range {
  background: var(--ab-line);
  color: var(--ab-ink);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .ab-seg-btn,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-seg-btn {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .ab-seg-btn, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-seg-btn):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-tabs [role="tab"],
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-tabs [role="tab"] {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-tabs [role="tab"], .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-tabs [role="tab"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .ab-card,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card,
.ab[data-ae="youch-voice-line"] .ab-card.sb-k-card,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card.sb-k-card {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card:is(.sb-k-card, .sb-home-card),
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card.sb-k-card:is(.sb-k-card, .sb-home-card) {
  padding-left: 0px !important;
  padding-right: 0px !important;
  padding-bottom: 0px !important;
}

.ab[data-ae="youch-voice-line"] .ab-row,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-row,
.ab[data-ae="youch-voice-line"] .sb-k-row,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-row {
  border-radius: 0px;
  background: none;
  box-shadow: none;
  border-top: 1px solid var(--mv-hair-soft);
}

.ab[data-ae="youch-voice-line"] .sb-k-badge,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-badge,
.ab[data-ae="youch-voice-line"] .sb-k-count,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-count {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border: 0px;
  border-radius: 0px;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .ab-row-bar,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-row-bar,
.ab[data-ae="youch-voice-line"] .sb-k-bar,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-bar {
  display: block;
  height: 0px;
  background: none;
  border-radius: 0px;
  border-bottom: 1px dotted var(--mv-hair-strong);
}

.ab[data-ae="youch-voice-line"] .ab-row-bar i,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-row-bar i,
.ab[data-ae="youch-voice-line"] .sb-k-bar i,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-bar i {
  display: none;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-row-bar,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-bar {
  position: relative;
  margin: 0px;
  border: 0px;
  background: var(--mv-hair);
  align-self: auto;
  height: 2px !important;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-row-bar i,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-bar i {
  display: block;
  height: 100%;
  background: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-av,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-av {
  background: var(--ab-secondary);
  color: var(--ab-on-secondary);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-tooltip,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-tooltip {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border: 0px;
  border-radius: 0px;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .ab-card.sb-k-dialog,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .ab-card.sb-k-dialog,
.ab[data-ae="youch-voice-line"] .sb-k-dialog,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-dialog {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-sheet,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-sheet {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-toast,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-toast {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border: 0px;
  border-radius: 0px;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-callout {
  padding: 14px 0px;
  border-right: 0px;
  border-left: 0px;
  border-image: none;
  border-top: 2px solid var(--tone-ico, var(--tone, var(--ab-ink)));
  border-bottom: 1px solid var(--mv-hair);
  border-radius: 0px;
  background: none;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-callout[data-tone="info"] {
  --tone: var(--ab-ink);
  --tone-ico: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-menu,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-topbar,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-topbar {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: var(--ab-canvas);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-split-main,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-split-main,
.ab[data-ae="youch-voice-line"] .sb-k-split-more,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-split-more {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-fab,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-fab {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-fab, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-fab):is(:active, .sb-k-pressed, .is-pressed) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-link,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-link {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-stepper,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-stepper {
  background: transparent;
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-knob-dial,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-knob-dial {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-datefield .ab-input,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-datefield .ab-input {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair);
}

.ab[data-ae="youch-voice-line"] .sb-k-combo-in,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-combo-in {
  border-radius: 0px;
  background: none;
  box-shadow: inset 0 0 0 1px var(--mv-hair);
}

.ab[data-ae="youch-voice-line"] .sb-k-listbox,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-listbox {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-cal,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-cal {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-day,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-day {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-day, .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-day):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-wheel,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-wheel {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-acc,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-acc {
  border-radius: 0px;
  background: none;
  box-shadow: none;
  border-top: 1px solid var(--mv-hair-soft);
}

.ab[data-ae="youch-voice-line"] .sb-k-car-card,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-car-card {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-car-card:is(.sb-k-card, .sb-home-card) {
  padding-left: 0px !important;
  padding-right: 0px !important;
  padding-bottom: 0px !important;
}

.ab[data-ae="youch-voice-line"] .sb-k-mx-tile,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-mx-tile {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-menu-sep,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu-sep,
.ab[data-ae="youch-voice-line"] .sb-k-divider .ab-rule,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-divider .ab-rule {
  background: var(--ab-line);
  color: var(--ab-ink);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-section,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-section {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ab[data-ae="youch-voice-line"] .sb-k-empty,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-empty {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-scrim,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-scrim {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-side,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-side {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-drawer,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-drawer {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-pop,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-pop {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-tip,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-tip {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-lightbox,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-lightbox {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-lb-close,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-lb-close,
.ab[data-ae="youch-voice-line"] .sb-k-lb-prev,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-lb-prev,
.ab[data-ae="youch-voice-line"] .sb-k-lb-next,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-lb-next {
  background: transparent;
  color: var(--ab-ink);
  border: 2px solid var(--ab-canvas);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-tb-title,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-tb-title {
  background: none;
  box-shadow: none;
  border-radius: 0px;
  color: var(--ab-ink);
  font-size: 15px;
  letter-spacing: 0em;
  text-transform: uppercase;
}

.ab[data-ae="youch-voice-line"] .sb-tabs,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-tabs {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: var(--ab-canvas);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-navmenu,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-navmenu {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-nm-item,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-nm-item {
  padding: 0px;
  border: 0px;
  border-radius: 0px;
  background: none;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-sbar,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-sbar {
  background: var(--ab-line);
  color: var(--ab-ink);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-dd,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-dd {
  background: transparent;
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-menu [role="menuitem"],
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu [role="menuitem"],
.ab[data-ae="youch-voice-line"] .sb-k-menu [role="option"],
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu [role="option"] {
  border-radius: 0px;
  background: none;
  box-shadow: none;
  border-top: 1px solid var(--mv-hair-soft);
}

:is(.ab[data-ae="youch-voice-line"] .sb-k-menu [role="menuitem"], .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu [role="menuitem"], .ab[data-ae="youch-voice-line"] .sb-k-menu [role="option"], .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu [role="option"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  color: var(--ab-ink);
  font-weight: 600;
  background: none;
  border-bottom-color: var(--ab-ink);
}

:is(.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu [role="menuitem"], .ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu [role="option"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected) {
  border-bottom-color: var(--ab-ink);
}

:is(.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-menu [role="option"]):is([aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], :checked, .is-selected)::after {
  background: var(--ab-ink);
}

.ab[data-ae="youch-voice-line"] .sb-k-pie,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-pie,
.ab[data-ae="youch-voice-line"] .sb-k-pie-item,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-pie-item {
  background: var(--ab-canvas);
  color: var(--ab-ink);
  border: 2px solid var(--ab-ink);
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-spin,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-spin {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-k-skel-line,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-skel-line,
.ab[data-ae="youch-voice-line"] .sb-k-skel-av,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-skel-av,
.ab[data-ae="youch-voice-line"] .sb-k-skel-block,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-k-skel-block {
  background: var(--ab-line);
  color: var(--ab-ink);
  border-color: transparent;
  box-shadow: none;
}

.ab[data-ae="youch-voice-line"] .sb-badge,
.ab[data-ae="youch-voice-line"].sb-ab.sb-kit .sb-badge {
  background: var(--ab-ink);
  color: var(--ab-canvas);
  border-color: transparent;
  box-shadow: none;
}
```

### Actions

#### Primary button (`btn-primary`)

Use: The one main action on a screen.

- States: rest, pressed, focus, disabled
- Glossary terms covered: Button, Control

State: rest

```html
<button type="button" class="ab-cta sb-k-btn">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

State: pressed

```html
<button type="button" class="ab-cta sb-k-btn is-pressed sb-k-pressed">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

State: focus

```html
<button type="button" class="ab-cta sb-k-btn is-focus sb-k-focus">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

State: disabled

```html
<button type="button" class="ab-cta sb-k-btn" disabled="">
  <span class="ab-cta-label">Continue</span>
  <span class="ab-cta-arrow" aria-hidden="true"></span>
</button>
```

#### Secondary button (`btn-secondary`)

Use: The alternative next to a primary button.

- States: rest, pressed, focus, disabled
- Glossary terms covered: Button

State: rest

```html
<button type="button" class="ab-type-apply sb-k-btn2">Not now</button>
```

State: pressed

```html
<button type="button" class="ab-type-apply sb-k-btn2 is-pressed sb-k-pressed">Not now</button>
```

State: focus

```html
<button type="button" class="ab-type-apply sb-k-btn2 is-focus sb-k-focus">Not now</button>
```

State: disabled

```html
<button type="button" class="ab-type-apply sb-k-btn2" disabled="">Not now</button>
```

#### Text button (`btn-text`)

Use: Low-emphasis actions: Skip, Cancel, See all.

- States: rest, pressed
- Glossary terms covered: Button

State: rest

```html
<button type="button" class="sb-k-textbtn">See all</button>
```

State: pressed

```html
<button type="button" class="sb-k-textbtn is-pressed sb-k-pressed">See all</button>
```

#### Destructive button (`btn-destructive`)

Use: Delete, remove, sign out.

- States: rest, pressed
- Glossary terms covered: Button

State: rest

```html
<button type="button" class="sb-k-danger">Delete</button>
```

State: pressed

```html
<button type="button" class="sb-k-danger is-pressed sb-k-pressed">Delete</button>
```

#### Icon button (`btn-icon`)

Use: A single icon action in a top bar or row.

- States: rest, pressed
- Glossary terms covered: Button

State: rest

```html
<button aria-label="Notifications" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn">
  <svg class="sb-ico" data-i="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
</button>
```

State: pressed

```html
<button aria-label="Notifications" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn is-pressed sb-k-pressed">
  <svg class="sb-ico" data-i="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
</button>
```

#### Split button (`btn-split`)

Use: A default action plus a menu of related ones on an attached chevron.

- States: rest, open
- Glossary terms covered: Split Button

State: rest

```html
<div class="sb-k-splitwrap">
  <div class="sb-k-split">
    <button type="button" class="ab-cta sb-k-btn sb-k-split-main">
      <span class="ab-cta-label">Check in</span>
    </button>
    <button aria-label="More actions" aria-haspopup="menu" aria-expanded="false" type="button" class="ab-cta sb-k-split-more">
      <svg class="sb-ico" data-i="down" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
    </button>
  </div>
</div>
```

State: open

```html
<div class="sb-k-splitwrap">
  <div class="sb-k-split">
    <button type="button" class="ab-cta sb-k-btn sb-k-split-main">
      <span class="ab-cta-label">Check in</span>
    </button>
    <button aria-label="More actions" aria-haspopup="menu" aria-expanded="true" type="button" class="ab-cta sb-k-split-more">
      <svg class="sb-ico" data-i="down" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
    </button>
  </div>
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem" aria-selected="true">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Save as draft</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
      <span>Share</span>
    </li>
  </ul>
</div>
```

#### Floating button (`fab`)

Use: The screen's main create action, floating above scrolling content.

- States: rest, pressed
- Glossary terms covered: Floating Button

State: rest

```html
<div class="sb-k-fabbox">
  <ul class="ab-list sb-k-list is-open">
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Mobility basics</span>
        <span class="sb-k-sub">Booked</span>
      </span>
      <span class="sb-k-trail">
        100%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Breathwork</span>
        <span class="sb-k-sub">Waitlist</span>
      </span>
      <span class="sb-k-trail">
        40%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
  </ul>
  <button aria-label="Book session" type="button" class="ab-cta sb-k-fab">
    <svg class="sb-ico" data-i="plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
  </button>
</div>
```

State: pressed

```html
<div class="sb-k-fabbox">
  <ul class="ab-list sb-k-list is-open">
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Mobility basics</span>
        <span class="sb-k-sub">Booked</span>
      </span>
      <span class="sb-k-trail">
        100%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
    <li class="ab-row sb-k-row" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Breathwork</span>
        <span class="sb-k-sub">Waitlist</span>
      </span>
      <span class="sb-k-trail">
        40%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
  </ul>
  <button aria-label="Book session" type="button" class="ab-cta sb-k-fab is-pressed sb-k-pressed">
    <svg class="sb-ico" data-i="plus" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
  </button>
</div>
```

#### Link (`link`)

Use: Text that goes to another page or opens a resource.

- States: rest, pressed, focus
- Glossary terms covered: Link

State: rest

```html
<p class="sb-k-para">
  By continuing you accept the
  <a role="link" tabindex="0" class="sb-k-link">terms of use</a>
  .
</p>
```

State: pressed

```html
<p class="sb-k-para">
  By continuing you accept the
  <a role="link" tabindex="0" class="sb-k-link is-pressed sb-k-pressed">terms of use</a>
  .
</p>
```

State: focus

```html
<p class="sb-k-para">
  By continuing you accept the
  <a role="link" tabindex="0" class="sb-k-link is-focus sb-k-focus">terms of use</a>
  .
</p>
```

#### Icon (`icon`)

Use: One line-icon set at fixed sizes, always paired with a label or an accessible name.

- States: rest
- Glossary terms covered: Icon

State: rest

```html
<div class="sb-k-icons">
  <span class="sb-k-icon">
    <svg class="sb-ico" data-i="search" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
    <span>Search · 20</span>
  </span>
  <span class="sb-k-icon">
    <svg class="sb-ico" data-i="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
    <span>Home · 24</span>
  </span>
  <span class="sb-k-icon">
    <svg class="sb-ico" data-i="gear" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3"></circle><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"></path></svg>
    <span>Settings · 28</span>
  </span>
</div>
```

### Inputs

#### Text field (`field`)

Use: Single-line entry with a label above it.

- States: rest, focus, error, disabled
- Glossary terms covered: Control, Input Control, Textbox

State: rest

```html
<div class="sb-field sb-k-field is-rest">
  <label class="ab-fieldlabel" for="sb43b-kf44">Email</label>
  <input class="ab-input" type="text" value="" placeholder="you@example.com" autocomplete="off" spellcheck="false">
  <p class="sb-k-help">We send receipts here.</p>
</div>
```

State: focus

```html
<div class="sb-field sb-k-field is-focus">
  <label class="ab-fieldlabel" for="sb43b-kf45">Email</label>
  <input class="ab-input" type="text" value="maya@youch.com" placeholder="you@example.com" autocomplete="off" spellcheck="false">
</div>
```

State: error

```html
<div class="sb-field sb-k-field is-error">
  <label class="ab-fieldlabel" for="sb43b-kf46">Email</label>
  <input class="ab-input" type="text" value="hello@" placeholder="you@example.com" autocomplete="off" spellcheck="false" aria-invalid="true">
  <p class="sb-k-help is-error">Enter a full email address.</p>
</div>
```

State: disabled

```html
<div class="sb-field sb-k-field is-disabled">
  <label class="ab-fieldlabel" for="sb43b-kf47">Email</label>
  <input class="ab-input" type="text" value="maya@youch.com" placeholder="you@example.com" autocomplete="off" spellcheck="false" disabled="">
</div>
```

#### Search field (`search`)

Use: Search with a leading icon.

- States: rest, focus
- Glossary terms covered: Input Control, Textbox

State: rest

```html
<div class="sb-search sb-k-search is-rest">
  <svg class="sb-ico" data-i="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
  <input class="ab-input" type="text" placeholder="Search clients" value="" aria-label="Search clients" autocomplete="off">
</div>
```

State: focus

```html
<div class="sb-search sb-k-search is-focus">
  <svg class="sb-ico" data-i="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
  <input class="ab-input" type="text" placeholder="Search clients" value="Strength" aria-label="Search clients" autocomplete="off">
</div>
```

#### Select (`select`)

Use: Pick one value from a list.

- States: rest, open
- Glossary terms covered: Dropdown List, Input Control

State: rest

```html
<div class="sb-k-selectwrap">
  <p class="ab-fieldlabel">Show</p>
  <button type="button" class="ab-input sb-k-select" aria-haspopup="listbox" aria-expanded="false">
    <span>Today</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
</div>
```

State: open

```html
<div class="sb-k-selectwrap">
  <p class="ab-fieldlabel">Show</p>
  <button type="button" class="ab-input sb-k-select" aria-haspopup="listbox" aria-expanded="true">
    <span>Today</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
  <ul class="sb-k-menu" role="listbox">
    <li role="option" aria-selected="true">
      <span>Today</span>
      <svg class="sb-ico" data-i="check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
    </li>
    <li role="option" aria-selected="false">
      <span>This week</span>
    </li>
    <li role="option" aria-selected="false">
      <span>Everything</span>
    </li>
  </ul>
</div>
```

#### Combo box (`combo`)

Use: Type a value or pick one of the suggestions that match.

- States: rest, open
- Glossary terms covered: Combo Box, Input Control

State: rest

```html
<div class="sb-field sb-k-field sb-k-combo is-rest">
  <label class="ab-fieldlabel" for="sb43b-kc48">Assign to</label>
  <input class="ab-input sb-k-combo-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" value="" placeholder="Type a name" autocomplete="off" spellcheck="false">
</div>
```

State: open

```html
<div class="sb-field sb-k-field sb-k-combo is-focus">
  <label class="ab-fieldlabel" for="sb43b-kc49">Assign to</label>
  <input class="ab-input sb-k-combo-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" value="Ma" placeholder="Type a name" autocomplete="off" spellcheck="false">
  <ul class="sb-k-menu" role="listbox">
    <li role="option" aria-selected="true">
      <span>
        <mark class="sb-k-match">Ma</mark>
        ya Ortiz
      </span>
    </li>
    <li role="option" aria-selected="false">
      <span>
        <mark class="sb-k-match">Ma</mark>
        ra Lindqvist
      </span>
    </li>
    <li role="option" aria-selected="false">
      <span>
        <mark class="sb-k-match">Ma</mark>
        rcus Webb
      </span>
    </li>
  </ul>
</div>
```

#### Listbox (`listbox`)

Use: A visible list of options; pick one or several without opening anything.

- States: single, multiple
- Glossary terms covered: Input Control, Listbox

State: single

```html
<ul class="sb-k-menu sb-k-listbox" role="listbox" aria-label="Your week">
  <li role="option" aria-selected="true">
    <span>Mobility basics</span>
    <svg class="sb-ico" data-i="check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
  </li>
  <li role="option" aria-selected="false">
    <span>Breathwork</span>
  </li>
  <li role="option" aria-selected="false">
    <span>Sleep reset</span>
  </li>
</ul>
```

State: multiple

```html
<ul class="sb-k-menu sb-k-listbox" role="listbox" aria-multiselectable="true" aria-label="Your week">
  <li role="option" aria-selected="true">
    <input class="sb-k-box" type="checkbox" tabindex="-1" aria-hidden="true" checked="">
    <span>Mobility basics</span>
  </li>
  <li role="option" aria-selected="false">
    <input class="sb-k-box" type="checkbox" tabindex="-1" aria-hidden="true">
    <span>Breathwork</span>
  </li>
  <li role="option" aria-selected="true">
    <input class="sb-k-box" type="checkbox" tabindex="-1" aria-hidden="true" checked="">
    <span>Sleep reset</span>
  </li>
</ul>
```

#### Checkbox (`checkbox`)

Use: Multi-select options.

- States: off, on, disabled
- Glossary terms covered: Checkbox, Control, Input Control, State-Switch Control

State: off

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="checkbox">
  <span>Email me receipts</span>
</label>
```

State: on

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="checkbox" checked="">
  <span>Email me receipts</span>
</label>
```

State: disabled

```html
<label class="sb-k-check is-disabled">
  <input class="sb-k-box" type="checkbox" checked="" disabled="">
  <span>Email me receipts</span>
</label>
```

#### Radio (`radio`)

Use: Single choice from a short list.

- States: off, on
- Glossary terms covered: Input Control, Radio Button, State-Switch Control

State: off

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="radio" name="sb43b-kr50">
  <span>Daily</span>
</label>
```

State: on

```html
<label class="sb-k-check">
  <input class="sb-k-box" type="radio" name="sb43b-kr51" checked="">
  <span>Weekly</span>
</label>
```

#### Toggle (`toggle`)

Use: An on/off setting that applies at once.

- States: off, on, disabled
- Glossary terms covered: Control, Input Control, State-Switch Control, Toggle

State: off

```html
<label class="ab-toggle sb-tog" for="sb43b-t52">
  <span>Push notifications</span>
  <input class="ab-switch" type="checkbox">
</label>
```

State: on

```html
<label class="ab-toggle sb-tog" for="sb43b-t53">
  <span>Push notifications</span>
  <input class="ab-switch" type="checkbox" checked="">
</label>
```

State: disabled

```html
<label class="ab-toggle sb-tog is-disabled" for="sb43b-t54">
  <span>Push notifications</span>
  <input class="ab-switch" type="checkbox" checked="" disabled="">
</label>
```

#### Segmented control (`segmented`)

Use: Switch between 2 to 4 views of the same content.

- States: rest
- Glossary terms covered: Input Control, Segmented Button, State-Switch Control

State: rest

```html
<div class="ab-seg" role="group" aria-label="Show">
  <button type="button" class="ab-seg-btn" aria-pressed="true">Today</button>
  <button type="button" class="ab-seg-btn" aria-pressed="false">This week</button>
  <button type="button" class="ab-seg-btn" aria-pressed="false">All</button>
</div>
```

#### Input stepper (`stepper`)

Use: Raise or lower a small whole number one step at a time.

- States: rest, minimum
- Glossary terms covered: Control, Input Control, Input Stepper

State: rest

```html
<div class="sb-k-stepwrap">
  <span class="sb-k-step-l">Quantity</span>
  <div class="sb-k-stepper">
    <button aria-label="Decrease" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step">
      <svg class="sb-ico" data-i="minus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"></path></svg>
    </button>
    <output class="sb-k-step-val" aria-live="polite">2</output>
    <button aria-label="Increase" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step">
      <svg class="sb-ico" data-i="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
    </button>
  </div>
</div>
```

State: minimum

```html
<div class="sb-k-stepwrap">
  <span class="sb-k-step-l">Quantity</span>
  <div class="sb-k-stepper">
    <button aria-label="Decrease" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step" disabled="">
      <svg class="sb-ico" data-i="minus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"></path></svg>
    </button>
    <output class="sb-k-step-val" aria-live="polite">0</output>
    <button aria-label="Increase" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-step">
      <svg class="sb-ico" data-i="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
    </button>
  </div>
</div>
```

#### Slider (`slider`)

Use: A value on a continuous range.

- States: rest
- Glossary terms covered: Control, Input Control, Range Control, Slider

State: rest

```html
<div class="sb-k-slider">
  <div class="sb-k-slider-h">
    <span>Volume</span>
    <span>60%</span>
  </div>
  <input class="sb-k-range" type="range" min="0" max="100" value="60" style="--v:60%" aria-label="Volume">
</div>
```

#### Knob (`knob`)

Use: A value on a range, turned like a dial: audio and other media controls.

- States: rest
- Glossary terms covered: Input Control, Knob, Range Control

State: rest

```html
<div class="sb-k-knobwrap">
  <div class="sb-k-knob" role="slider" aria-label="Gain" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65" style="--v:0.65">
    <span class="sb-k-knob-arc"></span>
    <span class="sb-k-knob-dial">
      <i class="sb-k-knob-ind"></i>
    </span>
  </div>
  <div class="sb-k-knob-txt">
    <b>Gain</b>
    <span class="sb-k-knob-val">65%</span>
  </div>
</div>
```

### Pickers

#### Date picker (`date-field`)

Use: A date shown in a field; tapping it opens the calendar or wheels.

- States: rest, focus
- Glossary terms covered: Date Picker, Picker

State: rest

```html
<div class="sb-field sb-k-field sb-k-datefield is-rest">
  <label class="ab-fieldlabel" for="sb43b-kd55">Due date</label>
  <input class="ab-input" type="text" value="Nov 14, 2026" aria-haspopup="dialog" autocomplete="off" spellcheck="false" readonly="">
  <span class="sb-k-date-ico">
    <svg class="sb-ico" data-i="calendar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>
  </span>
</div>
```

State: focus

```html
<div class="sb-field sb-k-field sb-k-datefield is-focus">
  <label class="ab-fieldlabel" for="sb43b-kd56">Due date</label>
  <input class="ab-input" type="text" value="Nov 14, 2026" aria-haspopup="dialog" autocomplete="off" spellcheck="false" readonly="">
  <span class="sb-k-date-ico">
    <svg class="sb-ico" data-i="calendar" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>
  </span>
</div>
```

#### Calendar picker (`calendar`)

Use: A month grid for choosing a day or a range of days.

- States: single, range
- Glossary terms covered: Calendar Picker, Date Picker, Picker

State: single

```html
<div class="sb-k-cal">
  <div class="sb-k-cal-head">
    <button type="button" class="sb-k-plain" aria-label="Previous month">
      <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
    </button>
    <span class="sb-k-cal-t">November 2026</span>
    <button type="button" class="sb-k-plain" aria-label="Next month">
      <svg class="sb-ico" data-i="chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
    </button>
  </div>
  <div class="sb-k-cal-grid" role="grid">
    <span class="sb-k-cal-dow" aria-hidden="true">M</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">W</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">F</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">26</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">27</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">28</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">29</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">31</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 1">1</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 2">2</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 3">3</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 4">4</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 5">5</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 6">6</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 7">7</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 8">8</button>
    <button type="button" class="sb-k-day is-today" tabindex="-1" aria-label="November 9">9</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 10">10</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 11">11</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 12">12</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 13">13</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 14">14</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 15">15</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 16">16</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 17">17</button>
    <button type="button" class="sb-k-day is-sel" tabindex="-1" aria-label="November 18" aria-pressed="true">18</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 19">19</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 20">20</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 21">21</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 22">22</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 23">23</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 24">24</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 25">25</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 26">26</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 27">27</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 28">28</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 29">29</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 30">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">1</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">2</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">3</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">4</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">5</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">6</button>
  </div>
</div>
```

State: range

```html
<div class="sb-k-cal">
  <div class="sb-k-cal-head">
    <button type="button" class="sb-k-plain" aria-label="Previous month">
      <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
    </button>
    <span class="sb-k-cal-t">November 2026</span>
    <button type="button" class="sb-k-plain" aria-label="Next month">
      <svg class="sb-ico" data-i="chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
    </button>
  </div>
  <div class="sb-k-cal-grid" role="grid">
    <span class="sb-k-cal-dow" aria-hidden="true">M</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">W</span>
    <span class="sb-k-cal-dow" aria-hidden="true">T</span>
    <span class="sb-k-cal-dow" aria-hidden="true">F</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <span class="sb-k-cal-dow" aria-hidden="true">S</span>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">26</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">27</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">28</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">29</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">31</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 1">1</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 2">2</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 3">3</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 4">4</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 5">5</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 6">6</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 7">7</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 8">8</button>
    <button type="button" class="sb-k-day is-today" tabindex="-1" aria-label="November 9">9</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 10">10</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 11">11</button>
    <button type="button" class="sb-k-day is-sel is-range is-start" tabindex="-1" aria-label="November 12" aria-pressed="true">12</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 13">13</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 14">14</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 15">15</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 16">16</button>
    <button type="button" class="sb-k-day is-range" tabindex="-1" aria-label="November 17">17</button>
    <button type="button" class="sb-k-day is-sel is-range is-end" tabindex="-1" aria-label="November 18" aria-pressed="true">18</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 19">19</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 20">20</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 21">21</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 22">22</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 23">23</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 24">24</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 25">25</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 26">26</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 27">27</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 28">28</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 29">29</button>
    <button type="button" class="sb-k-day" tabindex="-1" aria-label="November 30">30</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">1</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">2</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">3</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">4</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">5</button>
    <button type="button" class="sb-k-day is-out" tabindex="-1" aria-hidden="true">6</button>
  </div>
</div>
```

#### Wheel picker (`wheel`)

Use: Spinning columns of values with the choice in a centre band.

- States: rest
- Glossary terms covered: Picker, Wheel Picker

State: rest

```html
<div class="sb-k-wheel" role="group" aria-label="Time">
  <div class="sb-k-wheel-col" role="listbox" aria-label="Hour">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">7</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">8</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">9</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">10</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">11</span>
  </div>
  <div class="sb-k-wheel-col" role="listbox" aria-label="Minute">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">10</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">20</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">30</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">40</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">50</span>
  </div>
  <i class="sb-k-wheel-band" aria-hidden="true"></i>
</div>
```

#### Wheel-style date picker (`wheel-date`)

Use: Month, day and year as three wheels.

- States: rest
- Glossary terms covered: Date Picker, Picker, Wheel-Style Date Picker

State: rest

```html
<div class="sb-k-wheel" role="group" aria-label="Date">
  <div class="sb-k-wheel-col" role="listbox" aria-label="Month">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">Sep</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">Oct</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">Nov</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">Dec</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">Jan</span>
  </div>
  <div class="sb-k-wheel-col" role="listbox" aria-label="Day">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">12</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">13</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">14</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">15</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">16</span>
  </div>
  <div class="sb-k-wheel-col" role="listbox" aria-label="Year">
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">2024</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">2025</span>
    <span class="sb-k-wheel-item is-d0 is-sel" role="option" aria-selected="true">2026</span>
    <span class="sb-k-wheel-item is-d1" role="option" aria-selected="false">2027</span>
    <span class="sb-k-wheel-item is-d2" role="option" aria-selected="false">2028</span>
  </div>
  <i class="sb-k-wheel-band" aria-hidden="true"></i>
</div>
```

### Containers

#### Card (`card`)

Use: A boxed group of related content and its action.

- States: rest
- Glossary terms covered: Card, Container

State: rest

```html
<div class="ab-card sb-k-card">
  <div class="ab-seg" role="group" aria-label="Show">
    <button type="button" class="ab-seg-btn" aria-pressed="true">Today</button>
    <button type="button" class="ab-seg-btn" aria-pressed="false">This week</button>
  </div>
  <h3 class="ab-card-title">Morning strength</h3>
  <p class="ab-card-body">
    7:30 am
    <span class="sb-k-mid">·</span>
    35 minutes
    <span class="sb-k-mid">·</span>
    Studio 2
  </p>
  <button type="button" class="ab-cta sb-k-btn">
    <span class="ab-cta-label">Check in</span>
    <span class="ab-cta-arrow" aria-hidden="true"></span>
  </button>
</div>
```

#### List rows (`list`)

Use: Grouped rows: label, value, chevron or control.

- States: rest, pressed
- Glossary terms covered: Container

State: rest

```html
<ul class="ab-list sb-k-list is-open">
  <li class="ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Mobility basics</span>
      <span class="sb-k-sub">Booked</span>
    </span>
    <span class="sb-k-trail">
      100%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
  <li class="ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Breathwork</span>
      <span class="sb-k-sub">Waitlist</span>
    </span>
    <span class="sb-k-trail">
      40%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
  <li class="ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Sleep reset</span>
      <span class="sb-k-sub">Starts Monday</span>
    </span>
    <span class="sb-k-trail">
      0%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
</ul>
```

State: pressed

```html
<ul class="ab-list sb-k-list">
  <li class="ab-row sb-k-row is-picked" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Breathwork</span>
      <span class="sb-k-sub">Waitlist</span>
    </span>
    <span class="sb-k-trail">
      40%
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </li>
</ul>
```

#### Accordion (`accordion`)

Use: Stacked headings that each open to show their section.

- States: closed, open
- Glossary terms covered: Accordion, Container

State: closed

```html
<div class="ab-list sb-k-list sb-k-accordion">
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Mobility basics</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Booked · 100% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Breathwork</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Waitlist · 40% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Sleep reset</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Starts Monday · 0% complete. Open it to see who is on it and what comes next.</p>
  </details>
</div>
```

State: open

```html
<div class="ab-list sb-k-list sb-k-accordion">
  <details class="sb-k-acc" open="">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Mobility basics</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Booked · 100% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Breathwork</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Waitlist · 40% complete. Open it to see who is on it and what comes next.</p>
  </details>
  <details class="sb-k-acc">
    <summary class="ab-row sb-k-row is-nolead sb-k-acc-sum">
      <span class="sb-k-text">
        <span class="sb-k-title">Sleep reset</span>
      </span>
      <span class="sb-k-trail">
        <span class="sb-k-chev sb-k-acc-chev">
          <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </span>
      </span>
    </summary>
    <p class="sb-k-acc-body">Starts Monday · 0% complete. Open it to see who is on it and what comes next.</p>
  </details>
</div>
```

#### Carousel (`carousel`)

Use: A row of cards that swipes sideways, one page at a time.

- States: rest
- Glossary terms covered: Carousel, Container

State: rest

```html
<div class="sb-k-carousel">
  <div class="sb-k-car-track" role="group" aria-roledescription="carousel" aria-label="Your week" tabindex="0">
    <div class="ab-card sb-k-card sb-k-car-card">
      <div class="sb-k-ph" aria-hidden="true">
        <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
      </div>
      <h3 class="ab-card-title">Mobility basics</h3>
      <p class="ab-card-body">Booked · 100%</p>
    </div>
    <div class="ab-card sb-k-card sb-k-car-card">
      <div class="sb-k-ph" aria-hidden="true">
        <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
      </div>
      <h3 class="ab-card-title">Breathwork</h3>
      <p class="ab-card-body">Waitlist · 40%</p>
    </div>
    <div class="ab-card sb-k-card sb-k-car-card">
      <div class="sb-k-ph" aria-hidden="true">
        <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
      </div>
      <h3 class="ab-card-title">Sleep reset</h3>
      <p class="ab-card-body">Starts Monday · 0%</p>
    </div>
  </div>
  <div class="sb-k-dots" aria-hidden="true">
    <i class="is-on"></i>
    <i></i>
    <i></i>
  </div>
</div>
```

#### 2D matrix (`matrix`)

Use: Rows of tiles: scroll down through rows, sideways within a row.

- States: rest
- Glossary terms covered: 2D Matrix, Container

State: rest

```html
<div class="sb-k-matrix">
  <div class="sb-k-mx-row">
    <div class="ab-labelrow sb-k-section sb-k-mx-label">
      <span class="ab-label">Your week</span>
      <button type="button" class="sb-k-textbtn sb-k-see">See all</button>
    </div>
    <div class="sb-k-mx-track">
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Mobility basics</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Breathwork</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Sleep reset</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Strength</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Mobility basics</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Sleep reset</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Breathwork</span>
      </div>
    </div>
  </div>
  <div class="sb-k-mx-row">
    <div class="ab-labelrow sb-k-section sb-k-mx-label">
      <span class="ab-label">Today</span>
      <button type="button" class="sb-k-textbtn sb-k-see">See all</button>
    </div>
    <div class="sb-k-mx-track">
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Strength</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Mobility basics</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Sleep reset</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Breathwork</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Mobility basics</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Breathwork</span>
      </div>
      <div class="sb-k-mx-tile">
        <div class="sb-k-ph" aria-hidden="true">
          <svg class="sb-ico" data-i="image" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
        </div>
        <span>Sleep reset</span>
      </div>
    </div>
  </div>
</div>
```

#### Callout (`callout`)

Use: An inline message: info, success, warning, error.

- States: info, success, warning, error
- Glossary terms covered: Container

State: info

```html
<div class="sb-k-callout" data-tone="info" role="status">
  <svg class="sb-ico" data-i="info" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5.5M12 7.6v.2"></path></svg>
  <div>
    <b>Heads up</b>
    <span>Prices change on the first of next month.</span>
  </div>
</div>
```

State: success

```html
<div class="sb-k-callout" data-tone="success" role="status">
  <svg class="sb-ico" data-i="ok" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="m8 12.3 2.8 2.8L16.2 9.5"></path></svg>
  <div>
    <b>Saved</b>
    <span>Your changes are live for everyone.</span>
  </div>
</div>
```

State: warning

```html
<div class="sb-k-callout" data-tone="warning" role="status">
  <svg class="sb-ico" data-i="warn" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5 21.5 20h-19z"></path><path d="M12 10v4.5M12 17.2v.2"></path></svg>
  <div>
    <b>Almost full</b>
    <span>You have used 90% of your storage.</span>
  </div>
</div>
```

State: error

```html
<div class="sb-k-callout" data-tone="error" role="alert">
  <svg class="sb-ico" data-i="err" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6M15 9l-6 6"></path></svg>
  <div>
    <b>Payment failed</b>
    <span>Update your card to keep your plan.</span>
  </div>
</div>
```

#### Divider and section label (`divider`)

Use: Separates and names groups of content.

- States: rest

State: rest

```html
<div class="sb-k-divider">
  <div class="ab-labelrow sb-k-section">
    <span class="ab-label">Your week</span>
    <span class="ab-label">3 items</span>
  </div>
  <p class="sb-k-para">Rows in a group sit under one section label.</p>
  <div class="ab-rule"></div>
  <p class="sb-k-para">A rule separates groups.</p>
</div>
```

### Overlays

#### Overlay (`overlay`)

Use: The dimmed layer behind anything modal; tapping it closes non-critical overlays.

- States: rest
- Glossary terms covered: Overlay

State: rest

```html
<div class="sb-k-overlaybox">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <div class="sb-k-topbar">
      <span></span>
      <span class="sb-k-tb-title">Your week</span>
      <span></span>
    </div>
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Mobility basics</span>
          <span class="sb-k-sub">Booked</span>
        </span>
        <span class="sb-k-trail">
          100%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Breathwork</span>
          <span class="sb-k-sub">Waitlist</span>
        </span>
        <span class="sb-k-trail">
          40%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Sleep reset</span>
          <span class="sb-k-sub">Starts Monday</span>
        </span>
        <span class="sb-k-trail">
          0%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <i class="sb-k-scrim" aria-hidden="true"></i>
  <div class="sb-k-toast sb-k-scrimnote" role="note">
    <span>Tap the dimmed area to close</span>
  </div>
</div>
```

#### Dialog (`dialog`)

Use: A centred box that stops the task for a decision or a warning.

- States: rest
- Glossary terms covered: Dialog, Overlay

State: rest

```html
<div class="sb-k-sheetbox sb-k-dialogbox is-under">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Mobility basics</span>
          <span class="sb-k-sub">Booked</span>
        </span>
        <span class="sb-k-trail">
          100%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Breathwork</span>
          <span class="sb-k-sub">Waitlist</span>
        </span>
        <span class="sb-k-trail">
          40%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Sleep reset</span>
          <span class="sb-k-sub">Starts Monday</span>
        </span>
        <span class="sb-k-trail">
          0%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <div class="ab-card sb-k-card sb-k-dialog" role="dialog" aria-modal="true" aria-labelledby="sb43b-kdl57">
    <h3 class="ab-card-title sb-k-dialog-t">Delete this item?</h3>
    <p class="ab-card-body sb-k-dialog-b">It is removed for everyone and cannot be recovered.</p>
    <div class="sb-k-dialog-a">
      <button type="button" class="ab-type-apply sb-k-btn2">Cancel</button>
      <button type="button" class="sb-k-danger">Delete</button>
    </div>
  </div>
</div>
```

#### Bottom sheet (`sheet`)

Use: A task or set of choices that slides up from the bottom.

- States: rest
- Glossary terms covered: Bottom Sheet

State: rest

```html
<div class="sb-k-sheetbox">
  <div class="sb-k-sheet" role="dialog" aria-label="Leave without saving?">
    <span class="sb-k-grab" aria-hidden="true"></span>
    <h3 class="ab-card-title sb-k-sheet-t">Leave without saving?</h3>
    <p class="sb-k-sheet-b">Your changes to this programs will be lost.</p>
    <div class="sb-k-sheet-a">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Keep editing</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
      <button type="button" class="ab-type-apply sb-k-btn2">Discard</button>
    </div>
  </div>
</div>
```

#### Side sheet (`side-sheet`)

Use: Supporting content or filters that slide in from the side edge.

- States: rest
- Glossary terms covered: Side Sheet

State: rest

```html
<div class="sb-k-sheetbox sb-k-sidebox is-under">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Mobility basics</span>
          <span class="sb-k-sub">Booked</span>
        </span>
        <span class="sb-k-trail">
          100%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Breathwork</span>
          <span class="sb-k-sub">Waitlist</span>
        </span>
        <span class="sb-k-trail">
          40%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Sleep reset</span>
          <span class="sb-k-sub">Starts Monday</span>
        </span>
        <span class="sb-k-trail">
          0%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <aside class="sb-k-side" role="dialog" aria-label="Filters">
    <div class="sb-k-side-h">
      <h3 class="ab-card-title sb-k-sheet-t">Filters</h3>
      <button type="button" class="sb-k-plain" aria-label="Close">
        <svg class="sb-ico" data-i="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"></path></svg>
      </button>
    </div>
    <div class="ab-labelrow sb-k-section">
      <span class="ab-label">Status</span>
    </div>
    <label class="sb-k-check">
      <input class="sb-k-box" type="checkbox" checked="">
      <span>Booked</span>
    </label>
    <label class="sb-k-check">
      <input class="sb-k-box" type="checkbox">
      <span>Waitlist</span>
    </label>
    <label class="sb-k-check">
      <input class="sb-k-box" type="checkbox">
      <span>Starts Monday</span>
    </label>
    <div class="sb-k-sheet-a">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Apply</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
      <button type="button" class="ab-type-apply sb-k-btn2">Reset</button>
    </div>
  </aside>
</div>
```

#### Popup (`popover`)

Use: A small panel attached to the control that opened it.

- States: rest
- Glossary terms covered: Popup

State: rest

```html
<div class="sb-k-popbox">
  <button aria-haspopup="dialog" aria-expanded="true" type="button" class="ab-type-apply sb-k-btn2 sb-k-auto">
    <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
    <span>Share</span>
  </button>
  <div class="ab-card sb-k-card sb-k-pop" role="dialog" aria-label="Share">
    <i class="sb-k-pop-arrow" aria-hidden="true"></i>
    <h3 class="ab-card-title">Share link</h3>
    <p class="ab-card-body">Anyone with the link can view. Only you can edit.</p>
    <button type="button" class="sb-k-textbtn">Copy link</button>
  </div>
</div>
```

#### Popup tip (`popup-tip`)

Use: A one-time hint pointing at a feature, with a way to dismiss it.

- States: rest
- Glossary terms covered: Popup Tip

State: rest

```html
<div class="sb-k-popbox is-end">
  <button aria-label="Book session" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-tip-target">
    <svg class="sb-ico" data-i="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
  </button>
  <div class="ab-card sb-k-card sb-k-pop sb-k-tip" role="dialog" aria-label="Tip">
    <i class="sb-k-pop-arrow" aria-hidden="true"></i>
    <h3 class="ab-card-title sb-k-tip-t">Start here</h3>
    <p class="ab-card-body sb-k-tip-b">Tap plus to book session. You can change it later.</p>
    <button type="button" class="sb-k-textbtn">Got it</button>
  </div>
</div>
```

#### Tooltip (`tooltip`)

Use: A short label for a control, shown on hover, focus or long press.

- States: rest
- Glossary terms covered: Tooltip

State: rest

```html
<div class="sb-k-popbox is-tooltip">
  <button aria-describedby="sb43b-ktt58" aria-label="Notifications" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn ">
    <svg class="sb-ico" data-i="bell" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
  </button>
  <div class="sb-k-tooltip" role="tooltip">
    Notifications
    <i class="sb-k-pop-arrow is-down" aria-hidden="true"></i>
  </div>
</div>
```

#### Lightbox (`lightbox`)

Use: One image enlarged over a dark layer, with close and next.

- States: rest
- Glossary terms covered: Lightbox, Overlay

State: rest

```html
<div class="sb-k-lightbox" role="dialog" aria-label="Image 3 of 12">
  <div class="sb-k-lb-img sb-k-ph" aria-hidden="true">
    <svg class="sb-ico" data-i="image" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"></rect><circle cx="9" cy="10" r="1.6"></circle><path d="m4 17.5 5-4.5 4 3.5 3-2.5 4 3.5"></path></svg>
  </div>
  <button type="button" class="sb-k-plain sb-k-lb-close" aria-label="Close">
    <svg class="sb-ico" data-i="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"></path></svg>
  </button>
  <button type="button" class="sb-k-plain sb-k-lb-prev" aria-label="Previous image">
    <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
  </button>
  <button type="button" class="sb-k-plain sb-k-lb-next" aria-label="Next image">
    <svg class="sb-ico" data-i="chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
  </button>
  <p class="sb-k-lb-cap">3 of 12</p>
</div>
```

### Navigation

#### Top bar (`topbar`)

Use: Screen title, back and one or two icon actions.

- States: rest
- Glossary terms covered: Navigation Bar

State: rest

```html
<div class="sb-k-topbar">
  <button type="button" class="sb-k-plain" aria-label="Back">
    <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
  </button>
  <span class="sb-k-tb-title">Settings</span>
  <button type="button" class="sb-k-plain" aria-label="More">
    <svg class="sb-ico" data-i="more" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="5.5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="18.5" cy="12" r="1.2"></circle></svg>
  </button>
</div>
```

#### Tab bar (`tabbar`)

Use: 3 to 5 top-level destinations at the bottom of a phone.

- States: rest
- Glossary terms covered: Tab Bar

State: rest

```html
<div class="sb-k-tabbarbox">
  <nav class="sb-tabs" aria-label="App">
    <button type="button" class="sb-tab" aria-current="page">
      <svg class="sb-ico" data-i="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
      <span>Today</span>
    </button>
    <button type="button" class="sb-tab">
      <svg class="sb-ico" data-i="list" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
      <span>Classes</span>
    </button>
    <button type="button" class="sb-tab">
      <svg class="sb-ico" data-i="heart" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"></path></svg>
      <span>Progress</span>
    </button>
    <button type="button" class="sb-tab">
      <svg class="sb-ico" data-i="user" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"></path></svg>
      <span>Profile</span>
    </button>
  </nav>
</div>
```

#### Tabs (`tabs`)

Use: In-page sections under a title.

- States: rest
- Glossary terms covered: Tab Bar

State: rest

```html
<div class="sb-k-tabs" role="tablist">
  <button type="button" role="tab" aria-selected="true">Overview</button>
  <button type="button" role="tab" aria-selected="false">Activity</button>
  <button type="button" role="tab" aria-selected="false">Members</button>
</div>
```

#### Navigation menu (`nav-menu`)

Use: A vertical list of destinations with the current one marked.

- States: rest
- Glossary terms covered: Menu, Navigation Menu

State: rest

```html
<nav class="ab-list sb-k-list sb-k-navmenu" aria-label="Sections">
  <a role="link" aria-current="page" class="sb-k-nm-item ab-row sb-k-row is-picked" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="home" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Overview</span>
    </span>
    <span class="sb-k-trail">
      <svg class="sb-ico" data-i="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
    </span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="list" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Schedule</span>
    </span>
    <span class="sb-k-trail"></span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="users" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"></path><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.5.8 2.6 2.5 3 5.2"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Clients</span>
    </span>
    <span class="sb-k-trail"></span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="box" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"></path><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Programs</span>
    </span>
    <span class="sb-k-trail"></span>
  </a>
</nav>
```

#### Drawer menu (`drawer`)

Use: Navigation hidden behind a menu button, sliding in from the side.

- States: rest
- Glossary terms covered: Drawer Menu, Menu

State: rest

```html
<div class="sb-k-sheetbox sb-k-drawerbox is-under">
  <div class="sb-k-under" aria-hidden="true" inert="">
    <div class="sb-k-topbar">
      <button type="button" class="sb-k-plain" aria-label="Menu">
        <svg class="sb-ico" data-i="menu" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
      </button>
      <span class="sb-k-tb-title">Your week</span>
      <span></span>
    </div>
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Mobility basics</span>
          <span class="sb-k-sub">Booked</span>
        </span>
        <span class="sb-k-trail">
          100%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Breathwork</span>
          <span class="sb-k-sub">Waitlist</span>
        </span>
        <span class="sb-k-trail">
          40%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Sleep reset</span>
          <span class="sb-k-sub">Starts Monday</span>
        </span>
        <span class="sb-k-trail">
          0%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <aside class="sb-k-drawer" role="dialog" aria-label="Menu">
    <span class="ab-brand sb-k-tb-brand">
      <span class="ab-mark" aria-hidden="true">
        <span>Y</span>
      </span>
      <span class="ab-wordmark">Youch!</span>
    </span>
    <nav class="ab-list sb-k-list sb-k-navmenu" aria-label="Sections">
      <a role="link" aria-current="page" class="sb-k-nm-item ab-row sb-k-row is-picked" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="home" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Overview</span>
        </span>
        <span class="sb-k-trail">
          <svg class="sb-ico" data-i="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
        </span>
      </a>
      <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="list" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Schedule</span>
        </span>
        <span class="sb-k-trail"></span>
      </a>
      <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="users" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3.5"></circle><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"></path><path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.5.8 2.6 2.5 3 5.2"></path></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Clients</span>
        </span>
        <span class="sb-k-trail"></span>
      </a>
      <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-ico">
            <svg class="sb-ico" data-i="box" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"></path><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"></path></svg>
          </span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Programs</span>
        </span>
        <span class="sb-k-trail"></span>
      </a>
    </nav>
  </aside>
</div>
```

#### Scrollbar (`scrollbar`)

Use: Shows where you are in content that scrolls, and drags it.

- States: rest
- Glossary terms covered: Scrollbar

State: rest

```html
<div class="sb-k-scroll">
  <div class="sb-k-scrollbox">
    <ul class="ab-list sb-k-list is-open">
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Mobility basics</span>
          <span class="sb-k-sub">Booked</span>
        </span>
        <span class="sb-k-trail">
          100%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Breathwork</span>
          <span class="sb-k-sub">Waitlist</span>
        </span>
        <span class="sb-k-trail">
          40%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Sleep reset</span>
          <span class="sb-k-sub">Starts Monday</span>
        </span>
        <span class="sb-k-trail">
          0%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Strength</span>
          <span class="sb-k-sub">Full</span>
        </span>
        <span class="sb-k-trail">
          100%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Mobility basics</span>
          <span class="sb-k-sub">Open</span>
        </span>
        <span class="sb-k-trail">
          60%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Sleep reset</span>
          <span class="sb-k-sub">Starting soon</span>
        </span>
        <span class="sb-k-trail">
          25%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
      <li class="ab-row sb-k-row" tabindex="0">
        <span class="sb-k-lead">
          <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
        </span>
        <span class="sb-k-text">
          <span class="sb-k-title">Breathwork</span>
          <span class="sb-k-sub">Open</span>
        </span>
        <span class="sb-k-trail">
          45%
          <span class="sb-k-chev">
            <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
          </span>
        </span>
      </li>
    </ul>
  </div>
  <div class="sb-k-sbar" role="scrollbar" aria-orientation="vertical" aria-controls="sb43b-ksb59" aria-valuemin="0" aria-valuemax="100" aria-valuenow="20">
    <i class="sb-k-sbar-thumb" style="--t:20%;--h:42%"></i>
  </div>
</div>
```

### Menus

#### Dropdown menu (`dropdown-menu`)

Use: A button that opens a list of commands.

- States: rest, open
- Glossary terms covered: Dropdown Menu, Menu

State: rest

```html
<div class="sb-k-ddwrap">
  <button aria-haspopup="menu" aria-expanded="false" type="button" class="ab-type-apply sb-k-btn2 sb-k-dd">
    <span>Actions</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
</div>
```

State: open

```html
<div class="sb-k-ddwrap">
  <button aria-haspopup="menu" aria-expanded="true" type="button" class="ab-type-apply sb-k-btn2 sb-k-dd">
    <span>Actions</span>
    <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
  </button>
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem" aria-selected="true">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Edit</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
      <span>Share</span>
    </li>
    <li class="sb-k-menu-sep" role="separator"></li>
    <li role="menuitem" class="is-danger">
      <svg class="sb-ico" data-i="trash" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5"></path></svg>
      <span>Delete</span>
    </li>
  </ul>
</div>
```

#### Contextual menu (`context-menu`)

Use: Actions for one item, on long press or right click.

- States: rest
- Glossary terms covered: Contextual Menu, Menu

State: rest

```html
<div class="sb-k-ctxbox">
  <ul class="ab-list sb-k-list">
    <li class="ab-row sb-k-row is-picked" tabindex="0">
      <span class="sb-k-lead">
        <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
      </span>
      <span class="sb-k-text">
        <span class="sb-k-title">Mobility basics</span>
        <span class="sb-k-sub">Booked</span>
      </span>
      <span class="sb-k-trail">
        100%
        <span class="sb-k-chev">
          <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
        </span>
      </span>
    </li>
  </ul>
  <ul class="sb-k-menu sb-k-cmdmenu sb-k-ctx" role="menu">
    <li role="menuitem" aria-selected="true">
      <svg class="sb-ico" data-i="folder" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
      <span>Open</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Rename</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="share" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
      <span>Share</span>
    </li>
    <li class="sb-k-menu-sep" role="separator"></li>
    <li role="menuitem" class="is-danger">
      <svg class="sb-ico" data-i="trash" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5"></path></svg>
      <span>Delete</span>
    </li>
  </ul>
</div>
```

#### Submenu (`submenu`)

Use: A menu item that opens a second list of its own.

- States: rest
- Glossary terms covered: Menu, Submenu

State: rest

```html
<div class="sb-k-subwrap">
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem">
      <svg class="sb-ico" data-i="edit" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
      <span>Edit</span>
    </li>
    <li role="menuitem" class="has-sub is-open" aria-selected="true" aria-haspopup="menu">
      <svg class="sb-ico" data-i="folder" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
      <span>Move to</span>
      <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
    </li>
    <li role="menuitem">
      <svg class="sb-ico" data-i="copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
      <span>Duplicate</span>
    </li>
  </ul>
  <ul class="sb-k-menu sb-k-cmdmenu" role="menu">
    <li role="menuitem" aria-selected="true">
      <span>Inbox</span>
    </li>
    <li role="menuitem">
      <span>Archive</span>
    </li>
    <li role="menuitem">
      <span>Drafts</span>
    </li>
  </ul>
</div>
```

#### Expandable menu (`expandable-menu`)

Use: Navigation items that open in place to show their children.

- States: rest
- Glossary terms covered: Expandable Menu, Menu

State: rest

```html
<nav class="ab-list sb-k-list sb-k-navmenu sb-k-expmenu is-open" aria-label="Sections">
  <a aria-expanded="true" role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="folder" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Your week</span>
    </span>
    <span class="sb-k-trail">
      <svg class="sb-ico" data-i="down" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
    </span>
  </a>
  <div class="sb-k-nm-children">
    <a role="link" aria-current="page" class="sb-k-nm-item ab-row sb-k-row is-picked is-nolead" tabindex="0">
      <span class="sb-k-text">
        <span class="sb-k-title">Mobility basics</span>
      </span>
    </a>
    <a role="link" class="sb-k-nm-item ab-row sb-k-row is-nolead" tabindex="0">
      <span class="sb-k-text">
        <span class="sb-k-title">Breathwork</span>
      </span>
    </a>
    <a role="link" class="sb-k-nm-item ab-row sb-k-row is-nolead" tabindex="0">
      <span class="sb-k-text">
        <span class="sb-k-title">Sleep reset</span>
      </span>
    </a>
  </div>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="inbox" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17z"></path><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Inbox</span>
    </span>
    <span class="sb-k-trail">
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </a>
  <a role="link" class="sb-k-nm-item ab-row sb-k-row" tabindex="0">
    <span class="sb-k-lead">
      <span class="sb-k-ico">
        <svg class="sb-ico" data-i="chart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path></svg>
      </span>
    </span>
    <span class="sb-k-text">
      <span class="sb-k-title">Reports</span>
    </span>
    <span class="sb-k-trail">
      <span class="sb-k-chev">
        <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
      </span>
    </span>
  </a>
</nav>
```

#### Pie menu (`pie-menu`)

Use: Up to 6 actions in a ring around the press point.

- States: rest
- Glossary terms covered: Menu, Pie Menu

State: rest

```html
<div class="sb-k-piebox">
  <div class="sb-k-pie" role="menu" aria-label="Actions">
    <i class="sb-k-pie-hub" aria-hidden="true"></i>
    <button role="menuitem" style="left:calc(50% + 0.0px);top:calc(50% + -76.0px)" aria-label="Edit" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item is-on is-pressed sb-k-pressed">
      <svg class="sb-ico" data-i="edit" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4.5 19.5 1-4.2 9.8-9.8a1.8 1.8 0 0 1 2.5 0l.7.7a1.8 1.8 0 0 1 0 2.5l-9.8 9.8z"></path><path d="m13.5 7.5 3 3"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + 65.8px);top:calc(50% + -38.0px)" aria-label="Duplicate" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="copy" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="8.5" y="8.5" width="11" height="11" rx="2"></rect><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + 65.8px);top:calc(50% + 38.0px)" aria-label="Share" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="share" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 15V4M8 7.5l4-4 4 4"></path><path d="M6 11h-.5A1.5 1.5 0 0 0 4 12.5v6A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H18"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + 0.0px);top:calc(50% + 76.0px)" aria-label="Favourite" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="star" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.7-4.8 2.7 1-5.4-4-3.8 5.4-.7z"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + -65.8px);top:calc(50% + 38.0px)" aria-label="Move" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="folder" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 7v11A1.5 1.5 0 0 0 5 19.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7L10 5.5H5A1.5 1.5 0 0 0 3.5 7z"></path></svg>
    </button>
    <button role="menuitem" style="left:calc(50% + -65.8px);top:calc(50% + -38.0px)" aria-label="Delete" type="button" class="ab-type-apply sb-icon-btn sb-k-iconbtn sb-k-pie-item">
      <svg class="sb-ico" data-i="trash" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5"></path></svg>
    </button>
  </div>
</div>
```

### Feedback

#### Badge and tag (`badge`)

Use: Status, counts and categories.

- States: neutral, accent
- Glossary terms covered: Badge

State: neutral

```html
<div class="sb-k-row-inline">
  <span class="ab-fit">Draft</span>
  <span class="ab-fit" data-fit="match">Booked</span>
  <span class="sb-k-count">12</span>
</div>
```

State: accent

```html
<div class="sb-k-row-inline">
  <span class="sb-k-badge">New</span>
  <span class="sb-k-count is-accent">3</span>
  <span class="sb-k-dotwrap">
    <svg class="sb-ico" data-i="bell" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
    <i class="sb-badge" aria-hidden="true"></i>
  </span>
</div>
```

#### Progress (`progress`)

Use: A bar for known progress.

- States: rest
- Glossary terms covered: Progress Bar, Progress Indicator

State: rest

```html
<div class="sb-k-progress">
  <div class="sb-k-slider-h">
    <span>Uploading 3 files</span>
    <span>62%</span>
  </div>
  <span class="ab-row-bar sb-k-bar" role="progressbar" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100">
    <i style="width:62%"></i>
  </span>
</div>
```

#### Spinner (`spinner`)

Use: Unknown wait under a few seconds.

- States: rest
- Glossary terms covered: Progress Indicator, Spinner

State: rest

```html
<div class="sb-k-spinner" role="status">
  <i class="sb-k-spin" aria-hidden="true"></i>
  <span>Loading</span>
</div>
```

#### Skeleton screen (`skeleton`)

Use: Blocks in the shape of the coming layout while content loads.

- States: rest
- Glossary terms covered: Progress Indicator, Skeleton Screen

State: rest

```html
<div class="sb-k-skel" role="status" aria-busy="true" aria-label="Loading">
  <div class="sb-k-skel-row">
    <i class="sb-k-skel-av"></i>
    <span>
      <i class="sb-k-skel-line is-l1"></i>
      <i class="sb-k-skel-line is-l2"></i>
    </span>
  </div>
  <div class="sb-k-skel-row">
    <i class="sb-k-skel-av"></i>
    <span>
      <i class="sb-k-skel-line is-l1"></i>
      <i class="sb-k-skel-line is-l2"></i>
    </span>
  </div>
  <div class="sb-k-skel-row">
    <i class="sb-k-skel-av"></i>
    <span>
      <i class="sb-k-skel-line is-l1"></i>
      <i class="sb-k-skel-line is-l2"></i>
    </span>
  </div>
  <i class="sb-k-skel-block"></i>
</div>
```

#### Toast (`toast`)

Use: A brief confirmation that disappears by itself.

- States: rest
- Glossary terms covered: Snackbar

State: rest

```html
<div class="sb-k-toast" role="status">
  <svg class="sb-ico" data-i="check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
  <span>Checked in</span>
  <button type="button">Undo</button>
</div>
```

#### Empty state (`empty`)

Use: What to do when there is nothing here yet.

- States: rest

State: rest

```html
<div class="sb-k-empty">
  <span class="sb-k-emptyico" aria-hidden="true">
    <svg class="sb-ico" data-i="inbox" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 13.5 6 5h12l2.5 8.5V19h-17z"></path><path d="M3.5 13.5H9a3 3 0 0 0 6 0h5.5"></path></svg>
  </span>
  <h3 class="ab-card-title sb-k-empty-t">Nothing here yet</h3>
  <p class="sb-k-empty-b">When you add your first one, it shows up here.</p>
  <button type="button" class="ab-type-apply sb-k-btn2 sb-k-auto">
    <svg class="sb-ico" data-i="plus" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
    <span>Book session</span>
  </button>
</div>
```

#### Avatar (`avatar`)

Use: A person or account: photo or initials.

- States: rest

State: rest

```html
<div class="sb-k-row-inline">
  <span class="sb-k-av sb-k-av-s" aria-hidden="true">MO</span>
  <span class="sb-k-av" aria-hidden="true">SO</span>
  <span class="sb-k-av sb-k-av-l" aria-hidden="true">LF</span>
  <span class="sb-k-avs">
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">MO</span>
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">SO</span>
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">LF</span>
    <span class="sb-k-av sb-k-av-s" aria-hidden="true">JR</span>
  </span>
</div>
```

## Part 4: Screen layouts

These are the screen patterns every screen is assembled from. Each lists its blocks top to bottom, its rules, and the reference markup of the 390 x 844 phone screen (the device frame is only a presentation aid). Build screens from the Part 3 components in this order and keep the rules.

### Onboarding (`onboarding`)

Use: First run: what the app does and one way in.

Blocks, top to bottom: `topbar`, `title`, `body`, `list`, `btn-primary`, `btn-text`

Rules:

- One Large title and one sentence of body; at most 3 feature rows.
- Content block centred between the top bar and the actions.
- Primary button and one text button pinned above the home indicator.
- No illustration, pattern or art: the brand shows in type, colour and components.

```html
<div class="sb-k-scr" data-scr="onboarding">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <span></span>
        <span class="sb-k-tb-title">
          <span class="ab-brand sb-k-tb-brand">
            <span class="ab-mark" aria-hidden="true">
              <span>Y</span>
            </span>
            <span class="ab-wordmark">Youch!</span>
          </span>
        </span>
        <span></span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-headline sb-ob-h">
        A short tagline that captures the
        <span class="ab-hl-glue">
          <span class="ab-hl">brand</span>
          .
        </span>
      </h2>
    </div>
    <div class="sb-k-blk" data-blk="body">
      <p class="ab-subcopy sb-ob-body">Short sessions, gentle reminders and progress you can actually see.</p>
    </div>
    <div class="sb-k-blk" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-ico">
              <svg class="sb-ico" data-i="check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12.5 4.5 4.5L19 7.5"></path></svg>
            </span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Small classes</span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-ico">
              <svg class="sb-ico" data-i="bell" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"></path><path d="M10 20.5a2 2 0 0 0 4 0"></path></svg>
            </span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Book in seconds</span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-ico">
              <svg class="sb-ico" data-i="heart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"></path></svg>
            </span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Progress you can see</span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="btn-primary">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Get started</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
    </div>
    <div class="sb-k-blk" data-blk="btn-text">
      <button type="button" class="sb-k-textbtn sb-k-center">I have an account</button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### List (`list`)

Use: A home or index screen: many items, one tap to open.

Blocks, top to bottom: `topbar`, `title`, `search`, `segmented`, `section`, `list`, `tabbar`

Rules:

- Large title that collapses into the top bar on scroll.
- Search and filters sit above the first section, never inside rows.
- Rows are 52pt minimum with one line of title and one of detail; trailing value or chevron.
- The list scrolls under the tab bar and ends above it; nothing hides behind it.

```html
<div class="sb-k-scr" data-scr="list">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <span></span>
        <span class="sb-k-tb-title"></span>
        <button type="button" class="sb-k-plain" aria-label="Book session">
          <svg class="sb-ico" data-i="plus" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"></path></svg>
        </button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">Your week</h2>
    </div>
    <div class="sb-k-blk" data-blk="search">
      <div class="sb-search sb-k-search is-rest">
        <svg class="sb-ico" data-i="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
        <input class="ab-input" type="text" placeholder="Search clients" value="" aria-label="Search clients" autocomplete="off">
      </div>
    </div>
    <div class="sb-k-blk" data-blk="segmented">
      <div class="ab-seg" role="group" aria-label="Show">
        <button type="button" class="ab-seg-btn" aria-pressed="true">Today</button>
        <button type="button" class="ab-seg-btn" aria-pressed="false">This week</button>
        <button type="button" class="ab-seg-btn" aria-pressed="false">All</button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">Today</span>
        <span class="ab-label">7 items</span>
      </div>
    </div>
    <div class="sb-k-blk sb-k-fill" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Mobility basics</span>
            <span class="sb-k-sub">Booked</span>
          </span>
          <span class="sb-k-trail">
            100%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Breathwork</span>
            <span class="sb-k-sub">Waitlist</span>
          </span>
          <span class="sb-k-trail">
            40%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Sleep reset</span>
            <span class="sb-k-sub">Starts Monday</span>
          </span>
          <span class="sb-k-trail">
            0%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Strength</span>
            <span class="sb-k-sub">Full</span>
          </span>
          <span class="sb-k-trail">
            100%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">M</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Mobility basics</span>
            <span class="sb-k-sub">Open</span>
          </span>
          <span class="sb-k-trail">
            60%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">S</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Sleep reset</span>
            <span class="sb-k-sub">Starting soon</span>
          </span>
          <span class="sb-k-trail">
            25%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row sb-k-cut" tabindex="0">
          <span class="sb-k-lead">
            <span class="sb-k-av sb-k-av-s" aria-hidden="true">B</span>
          </span>
          <span class="sb-k-text">
            <span class="sb-k-title">Breathwork</span>
            <span class="sb-k-sub">Open</span>
          </span>
          <span class="sb-k-trail">
            45%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="tabbar">
      <nav class="sb-tabs" aria-label="App">
        <button type="button" class="sb-tab" aria-current="page">
          <svg class="sb-ico" data-i="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
          <span>Today</span>
        </button>
        <button type="button" class="sb-tab">
          <svg class="sb-ico" data-i="list" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6h12M8 12h12M8 18h12"></path><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle></svg>
          <span>Classes</span>
        </button>
        <button type="button" class="sb-tab">
          <svg class="sb-ico" data-i="heart" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"></path></svg>
          <span>Progress</span>
        </button>
        <button type="button" class="sb-tab">
          <svg class="sb-ico" data-i="user" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"></path></svg>
          <span>Profile</span>
        </button>
      </nav>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### Detail (`detail`)

Use: One item: its facts and what you can do with it.

Blocks, top to bottom: `topbar`, `title`, `badge`, `card`, `section`, `list`, `btn-primary`

Rules:

- Back button and at most two icon actions in the top bar.
- Title, status badge, then one summary card with the key numbers.
- Secondary facts as label/value rows in a grouped list.
- One primary action, at the bottom or in the top bar, never both.

```html
<div class="sb-k-scr" data-scr="detail">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <button type="button" class="sb-k-plain" aria-label="Back">
          <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
        </button>
        <span class="sb-k-tb-title"></span>
        <button type="button" class="sb-k-plain" aria-label="More">
          <svg class="sb-ico" data-i="more" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="5.5" cy="12" r="1.2"></circle><circle cx="12" cy="12" r="1.2"></circle><circle cx="18.5" cy="12" r="1.2"></circle></svg>
        </button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">Mobility basics</h2>
    </div>
    <div class="sb-k-blk" data-blk="badge">
      <div class="sb-k-row-inline">
        <span class="ab-fit">Booked</span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="card">
      <div class="ab-card sb-k-card">
        <h3 class="ab-card-title">100% done</h3>
        <p class="ab-card-body">
          7:30 am
          <span class="sb-k-mid">·</span>
          35 minutes
          <span class="sb-k-mid">·</span>
          Studio 2
        </p>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">Details</span>
      </div>
    </div>
    <div class="sb-k-blk sb-k-fill" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Status</span>
          </span>
          <span class="sb-k-trail">
            Booked
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Owner</span>
          </span>
          <span class="sb-k-trail">
            Maya Ortiz
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Updated</span>
          </span>
          <span class="sb-k-trail">
            Today
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Progress</span>
          </span>
          <span class="sb-k-trail">
            100%
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Cancel by</span>
          </span>
          <span class="sb-k-trail">
            12 hrs before
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="btn-primary">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Check in</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### Form (`form`)

Use: Create or edit something.

Blocks, top to bottom: `topbar`, `title`, `field`, `field`, `select`, `toggle`, `callout`, `btn-primary`

Rules:

- Labels above fields; one column; 16pt between fields, 28pt between groups.
- Errors appear under the field in the error colour, plus one callout at the top on submit.
- Primary action names the result ("Save", "Create invoice"), disabled until valid.
- Keyboard never covers the focused field or the primary action.

```html
<div class="sb-k-scr" data-scr="form">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <button type="button" class="sb-k-plain" aria-label="Back">
          <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
        </button>
        <span class="sb-k-tb-title"></span>
        <span></span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">Book session</h2>
    </div>
    <div class="sb-k-blk" data-blk="field">
      <div class="sb-field sb-k-field is-rest">
        <label class="ab-fieldlabel" for="sb43b-f60">Name</label>
        <input class="ab-input" type="text" value="Morning strength" autocomplete="off" spellcheck="false">
      </div>
    </div>
    <div class="sb-k-blk" data-blk="field">
      <div class="sb-field sb-k-field is-rest">
        <label class="ab-fieldlabel" for="sb43b-f61">Details</label>
        <input class="ab-input" type="text" value="7:30 am · 35 minutes · Studio 2" autocomplete="off" spellcheck="false">
      </div>
    </div>
    <div class="sb-k-blk" data-blk="select">
      <div class="sb-k-selectwrap">
        <p class="ab-fieldlabel">Show</p>
        <button type="button" class="ab-input sb-k-select" aria-haspopup="listbox" aria-expanded="false">
          <span>Today</span>
          <svg class="sb-ico" data-i="down" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9.5 6 6 6-6"></path></svg>
        </button>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="toggle">
      <label class="ab-toggle sb-tog" for="sb43b-t62">
        <span>New bookings</span>
        <input class="ab-switch" type="checkbox" checked="">
      </label>
    </div>
    <div class="sb-k-blk" data-blk="callout">
      <div class="sb-k-callout" data-tone="info" role="status">
        <svg class="sb-ico" data-i="info" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5.5M12 7.6v.2"></path></svg>
        <div>
          <b>Heads up</b>
          <span>Prices change on the first of next month.</span>
        </div>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="btn-primary">
      <button type="button" class="ab-cta sb-k-btn">
        <span class="ab-cta-label">Save</span>
        <span class="ab-cta-arrow" aria-hidden="true"></span>
      </button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

### Settings (`settings`)

Use: Preferences and account.

Blocks, top to bottom: `topbar`, `title`, `section`, `list`, `toggle`, `section`, `list`, `btn-destructive`

Rules:

- Grouped lists with small uppercase or tracked section labels.
- Each row is a label plus one control: toggle, value with chevron, or nothing.
- Changes apply at once; no Save button.
- Destructive action alone in the last group.

```html
<div class="sb-k-scr" data-scr="settings">
  <div class="sb-phone-in sb-k-scr-in">
    <div class="sb-statusbar" aria-hidden="true">
      <span>9:41</span>
      <span class="sb-sb-r">
        <i class="sb-sig"></i>
        <i class="sb-wifi"></i>
        <i class="sb-bat"></i>
      </span>
    </div>
    <div class="sb-k-blk" data-blk="topbar">
      <div class="sb-k-topbar">
        <button type="button" class="sb-k-plain" aria-label="Back">
          <svg class="sb-ico" data-i="back" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m14.5 6-6 6 6 6"></path></svg>
        </button>
        <span class="sb-k-tb-title"></span>
        <span></span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="title">
      <h2 class="ab-card-title sb-k-ltitle">Settings</h2>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">General</span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Name</span>
          </span>
          <span class="sb-k-trail">
            Maya Ortiz
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Language</span>
          </span>
          <span class="sb-k-trail">
            English
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead sb-k-togrow" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Notifications</span>
          </span>
          <span class="sb-k-trail">
            <input class="ab-switch" type="checkbox" checked="" aria-label="Notifications">
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="section">
      <div class="ab-labelrow sb-k-section">
        <span class="ab-label">About</span>
      </div>
    </div>
    <div class="sb-k-blk" data-blk="list">
      <ul class="ab-list sb-k-list is-open">
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Help</span>
          </span>
          <span class="sb-k-trail">
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Privacy</span>
          </span>
          <span class="sb-k-trail">
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
        <li class="ab-row sb-k-row is-nolead" tabindex="0">
          <span class="sb-k-text">
            <span class="sb-k-title">Version</span>
          </span>
          <span class="sb-k-trail">
            2.4
            <span class="sb-k-chev">
              <svg class="sb-ico" data-i="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9.5 6 6 6-6 6"></path></svg>
            </span>
          </span>
        </li>
      </ul>
    </div>
    <div class="sb-k-blk" data-blk="btn-destructive">
      <button type="button" class="sb-k-danger">Sign out</button>
    </div>
    <div class="sb-homebar" aria-hidden="true"></div>
  </div>
</div>
```

## Part 5: Patterns

Not included: this build is for an App, and app screens carry no patterns or art.

## Part 6: Logo

This brand has no vector logo to inline. Use the logo files from "Save brief + files" and place them as Part 1 says.

## Part 7: Verification checklist

Go through every item before you report back. An unchecked item means the work is not finished.

- [ ] Every colour in the code is a token from Part 2: search for hex values, `rgb(`, `hsl(` and named colours outside the token file and remove them.
- [ ] Every component in every state matches its Part 3 values: colours, sizes, radii, borders, shadows, type and spacing (rest, pressed, focus, disabled, open and the rest of each state list).
- [ ] Tap targets are 44pt or larger for everything tappable; buttons, fields and rows use the Part 1 heights.
- [ ] Type uses only the faces and the phone type scale from Part 1 (sizes, line heights, weights, case, tracking).
- [ ] Light and dark both work and use the designed values; nothing is inverted by a filter.
- [ ] Text contrast is 4.5:1 or better (3:1 for large text and icons), checked on the real backgrounds in both modes.
- [ ] Keyboard focus is visible on every control and uses the focus treatment from Part 3.
- [ ] Motion respects reduced motion: with `prefers-reduced-motion` on, animation stops or shortens as Part 1 says.
- [ ] No art, pattern, texture or decorative band appears in any app screen; the logo is used only where Part 1 puts it.
- [ ] Screens follow the Part 4 block order and rules; placeholder copy has been replaced.
