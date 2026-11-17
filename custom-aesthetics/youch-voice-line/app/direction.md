# Direction: Youch!

<!-- Copied by `node dev/lg.js direction <folder> --init`. Fill it before any style JSON or render.
Guidance lives in HTML comments; the gate and the build pack ignore comments. Replace every {{...}}.
How to think each section through: .claude/skills/ui-direction/references/thinking.md
**Sections** (1 to 5 before any render; all eight before the build pack)
1. Product truth
2. Content shape
3. The world
4. Thesis
5. Directions
6. System
7. Defaults ledger
8. Beyond the renderer
-->

## 1. Product truth

- Who and when: Walker, all day at a MacBook Pro, dictating about 99% of what he writes (long think-out-loud prompts into Claude and Dia, short replies in Slack and Mail). The dictation itself happens outside the window: hold Right Command, talk, let go, and the text is pasted where he was typing. The window is opened a few times a day for 10 to 60 seconds: to copy a dictation whose paste missed, to check what was removed, to teach a name ("Pramand", not "prominent"), to glance at Insights, or for a few minutes to read a meeting transcript with speakers.
- The moment that matters: two moments, one product promise. Outside the window, the instant the listening circle appears and, after release, the ring that fills until the paste. Inside the window, the proof that Youch! "never rewrites what you said": the kept text next to what was actually said, with removed fillers struck, spoken corrections marked and anything it learned named.
- Should feel: in Walker's words, "clean, sleek, modern ... classed up, kind of minimalist, kind of Bauhaus ... a little neo-brutal pop ... a slight bit of character, but also very, very proficient"; later "a little bit more modern, slightly more character". Calm, quick motion, never playful or bouncy (D-042).
- Must never feel: a colour highlight band behind a title or word (killed in round 4); a lollipop chart (replaced by an area graph); a live transcript window or anything popping up while dictating; frosted or milky glass; a SaaS dashboard of equal stat tiles; "simple" done as empty grey boxes; stock red for errors (errors are ink with an icon); board art, patterns or textures on app screens; a phone column stretched across a Mac window.
- Owner notes so far: Round 2 (2026-11-08): "For the history, I would keep it with option B" (Mail-style two-pane). Round 3: the listening circle of periwinkle static with the white made clear, "it looks amazing", and "it should disappear when it's not capturing". Round 4 (Looks Good, 2026-11-14): "a little bit more modern, slightly more character. I dont love the color highlighting". Round 5: "run with the circle and line one, and then I would just change this to an area graph", locked as Circle & Line (D-037): 1.5px ink-line pills and circles, periwinkle fills what is chosen, flat hairline cards at radius 20, Outfit 600 display with Inter text, butter at most once per screen as a small solid circle, Insights as a flat area graph. Motion (D-042): "having no animations is kind of chunky. We want it to be a little bit more premium." Rewording dial is Off / Low / High (D-038); the Structure key is gone (D-040). Earlier Looks Good folders for this app (youch-marker-proof, youch-circle-line) showed the renderer's limits: the Mac sidebar, list wrapper and selected row cannot be restyled, and a butter band under the title read as the killed highlight.

## 2. Content shape

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

## 3. The world

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

## 4. Thesis

Thesis: Voice is round, text is straight: anything spoken (listening, a dictation's start, an audio clip, a speaker) is a periwinkle disc, anything written sits as ink on a straight line, so every screen reads as voice turning into text, while the chrome steps back to bare rules and white space.
Tension: character but proficiency: character goes into the voice discs, the dictation length lines and the display type; proficiency goes into the lists, settings and transcripts, which stay dense, aligned and tabular.
Signature: the talk line, on History: every dictation is a periwinkle dot where Walker started talking and an ink line as long as he talked. It comes from the core action (hold, talk, let go), it reappears as the speaker turns in Recordings and the clip discs in Dictionary, and after release it closes into the ring in the overlay.
Principles:
1. Periwinkle means voice. Only spoken things are periwinkle (listening, audio, clips, speakers, the mark); selection and the main action are drawn in ink.
2. Round means spoken, straight means written. Discs and rings are reserved for voice; controls and text containers are straight-edged.
3. What you said always sits next to what was kept. No dictation hides its edits behind a tab or a second click.
4. Butter means learned. The one spark on a screen marks something Youch! learned, never decoration and never a band behind text.
5. One number per screen is large; every other number is small and tabular.

## 5. Directions

### A. Proof
- Thesis: History as a printer's proof: the kept text set like a page for reading, the said text beneath it marked up, and every change explained in a margin.
- Structure: the Mail-style two-pane window Walker chose: a 240 sidebar, a 340 list, the reader with a 200 margin column on its right for notes (corrections, learned words, cleanup level). Medium density.
- Type: Outfit 600 display (the locked voice), Newsreader for the kept text, because a proof is a printed page and a serif reads as the finished article; Inter for the UI and the said text.
- Colour: brand-led, as today: periwinkle fills the selected nav item, the chosen segment and the main action; voice discs periwinkle; butter for the learned note.
- Material: Circle & Line kept: 1.5px ink-line pills, flat hairline cards at radius 20, no shadow.
- Signature: the proof margin: each struck filler, spoken correction and learned word has a matching note in the reader's right margin.

### B. Steno
- Thesis: Every screen is a transcript: time codes and names in a fixed left gutter, words in one clean column, ruled like a stenographer's page.
- Structure: three columns without cards: the sidebar, a dense ledger list (time, app, length line, words in tabular columns), and a reader whose text runs beside a gutter of time codes. High density, everything on rules.
- Type: IBM Plex Sans throughout with tabular numerals and Plex's own weights for the column heads; a transcript is a working document, so one sober family with a clear scale.
- Colour: tonal: ink and greys do all the work; periwinkle appears only on voice (discs, the play head), butter only on a learned word.
- Material: ruled paper: hairline rules between rows, square corners (radius 4), no cards, no fills except the selected row's ink edge.
- Signature: the time-code gutter: every paragraph of a dictation and every turn of a recording carries the moment it was said, so the text can be played from any line.

### C. Score
- Thesis: The day as a score: dictations are drawn as dots and lines on a time axis, like notes on a stave, and the rest of the window is set in big flush-left Bauhaus type.
- Structure: History opens with a full-width strip, "today" as a time axis from 8 AM to now with each dictation a dot and a length line; below it the list and reader. Sparse, bold, few elements per screen; Insights is one huge numeral over one area.
- Type: Space Grotesk 700 display set very large and tight, with Inter for text: a grotesk with geometric quirks gives the Bauhaus poster its voice and the "slight bit of character".
- Colour: voice-led: periwinkle only on voice, ink for every control and selection (solid ink fills with canvas text, the neo-brutal pop), butter as the learned spark.
- Material: square-edged controls (radius 6) drawn with a 2px ink line; circles only for voice; flat planes with no shadows and no cards around lists.
- Signature: the day score at the top of History: the rhythm of a talking day at a glance, long prompts as long lines, quick replies as short ones.

Chosen: C + B ("Voice Line"). The round 1 critic and the author agree: C is the only direction whose mock argues the thesis, with a signature born from the core action (the day score and a talk line in every row), and it answers "more modern, slightly more character". From B it takes the time-code gutter beside the said text and the Recordings transcript, and B's discipline: no cards, groups made by rules and space. C's display face goes back to the locked Outfit (critic f8; the vendored Outfit has 400 and 600, so display is Outfit 600); Space Grotesk is offered to the owner as a named alternative. Everything else wrong with C lived in the bauhaus-poster kit (art shapes, stripes, periwinkle fills, caps), which the custom style drops.

## 6. System

<!-- The chosen direction as decisions, each with its reason in this product's terms. -->

### Layout
The real 1180x780 window: a 196px sidebar closed by a 2px ink rule (navigation is used every visit, so it is always one click away), then the page. Page titles sit flush left at the content edge (30px inside the rule) on a 2px ink rule that runs the page width. History, Recordings and Dictionary are two-pane: a 360px list column and the reader, split by a 1px hairline; Mail-style, as Walker chose. History adds the day score between title and panes: today on an 8 AM to now axis, so the gaps show the rhythm of the day. Density: medium in lists (58 to 64px rows), sparse in the reader. The main action lives in the reader's header row at the trailing edge (Copy ⌘C), never as a slab in the content; secondary actions sit beside it or in the footer next to the audio.

### Type
Outfit 600 for display (locked in D-037): page titles 56px, tracking -0.045em, leading 0.92; reader titles 28px; list names 16px; the Insights numeral 132px. Inter for everything else: kept text 21px / 1.5 (the dictation is the content, so it reads like a page), body 14px / 1.45, said text 15px / 1.75, meta and time codes 12.5px. Tabular figures on every number, time and duration. One small role for tracked capitals: section labels (TODAY, YESTERDAY, KEPT, SAID) in Inter 600 11px, 0.08em; nothing else is in capitals.

### Colour
Meaning-led: periwinkle means voice, ink means text and action, butter means learned. The palette roles say it too: primary is ink #101116 (the main action, selection and focus own it), secondary is periwinkle #8290C7 (voice owns it), accent is butter. Canvas #FAFAF7 and ink #101116 carry 95% of every screen. Periwinkle #8290C7 (3 to 5%) is only on spoken things: each dictation's start dot, play heads, voice clips, speaker discs, the listening circle and the mark. The selected item and the main action are solid ink with canvas text, so selection reads without colour. Butter #F6CF6B appears at most once per screen as a 10px disc beside something Youch! learned, never behind text. The Insights area is the flat secondary tint #DDE1F2. Dark mode is designed, not inverted: canvas #101116, ink #FAFAF7, rules #333438; selection and the main action become cream fills with dark text; periwinkle stays #8290C7 because voice is content and keeps its colour; the area becomes a 26% periwinkle mix on the canvas so it stays a quiet plane.

### Material and shape
Doing: straight-edged controls with 6px corners and a 2px ink line (secondary buttons, keycaps); fields are a square 1px hairline at rest (the ink at 50% in light, 31% in dark, about 3:1 in both) that turns ink on focus and becomes a 2px ink frame on error (cream in dark), so the three states read without colour; segmented controls are plain options with the chosen one filled ink and no outer track; switches are a square ink slug on a 1px ink track. The main action and the selected state are solid ink. Holding: no cards. The page is one plane; groups are made by space and rules: a 2px ink rule under titles and down the sidebar edge, 1px hairlines between rows and around the panes. Radius family: 6 on controls, 0 on planes, full round only for voice (discs, the overlay backing, the progress ring). No shadows, gradients, blur or glass anywhere.

### Motion
Press: controls move 1px down in 80 ms, no colour change. Select: the ink fill slides to the new row or segment in 180 ms, ease-move cubic-bezier(0.4,0,0.2,1); the reader crossfades 120 ms out, 180 ms in. Signature: when a new dictation lands, its dot appears and its line draws left to right in 240 ms, ease-out, in the list and in the day score; in the overlay, the ring closes with real progress around the held static. Reduce Motion: only a 120 ms opacity fade. Calm and quick (D-042), never springy.

### Words
The product's own words: "What you said", "Kept", "Said", "Learned: Preman → Pramand", "Hold ⌘ to talk", "Copy", "Copy what you said", "Fix a word", "Clips", "Who spoke". Sentence case everywhere. Empty History: "Hold Right Command and say something. It lands here, with what you said underneath." Empty Dictionary: "Names you say often go here. Add one and record it three times." Empty Insights: "Talk for a few days and your patterns show up here." Empty Recordings: "Drop a meeting or interview here. It never leaves this Mac."

### Craft
One strong left edge per pane (30px inside a rule); the gutter (52px) carries time codes right-aligned to a 16px gap before the text. Spacing steps 4, 8, 12, 16, 24, 32, 48; gaps inside a group are at most half the gap between groups. Selected rows are solid ink in both modes; in menus and pickers, where a check glyph marks the choice, the chosen option is set bold with an ink rule instead, so the glyph stays visible. Spoken corrections in What you said carry a small periwinkle caret, never an underline, because underlines mean actions. Focus is a 2px ink outline 2px out. Icons only where they add meaning (play, search); 1.75px strokes on a 20px grid. Every talk line uses one scale (3px per second, capped at 120px) so lengths compare across rows.

## 7. Defaults ledger

<!-- Every reflex gets a decision: "keep" with a reason in this product's terms, or "change" naming what
replaces it. Add a row for any other default you catch yourself using.
Why each reads as generic: .claude/skills/ui-direction/references/defaults-ledger.md -->

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

## 8. Beyond the renderer

<!-- First draw the idea with `chord` blocks and `column:` placement; list here only what those still
cannot draw (a custom chart, an illustration-like moment, a many-item grid). Each
gets an HTML mock under app/mocks/, rendered with `node dev/lg.js shot` into the round's renders folder.
The Mock path is relative to the app/ folder and must exist. If the renderer draws every idea, replace
the table with this exact line:
None: the renderer draws every idea. -->

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
| The listening overlay: a round dark backing with the clear periwinkle static | the overlay is not a window the renderer draws | mocks/overlay-pill.html |
| The finishing overlay: the static held still and a cream ring closing around it with real progress | same | mocks/overlay-ring.html |
