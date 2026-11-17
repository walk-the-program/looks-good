# Product: Youch!
Platform: mac
Purpose: Turns what Walker says into clean text wherever he types, fully on this Mac, and never rewrites what he said.
Core action: Hold Right Command, talk, let go: the text is pasted at the cursor and left on the clipboard.
Tabs: History, Dictionary, Insights, Recordings, Settings

## Screen: History
Job: Find a dictation in seconds, copy it again, and see exactly what was kept from what was said.
Primary action: Copy
Chrome: sidebar
Fold: the selected dictation's kept text, What you said, the Learned line and Copy sit above the fold.
Signature: the talk line: each dictation's start dot and a line as long as Walker talked.
Content:
1. text: Can you look at the Pramand proposal and tighten the second section? Keep the pricing table as is, but the timeline should be six weeks. | size: large
2. text: ~~um so~~ can you look at the ~~prominent~~ Pramand proposal and ~~like~~ tighten the second section keep the pricing table as is but the timeline should be ~~eight weeks oh actually~~ six weeks
3. text: Learned: Preman → Pramand. Youch! spells it that way from now on.
4. link: Undo
5. action: Copy | meta: ⌘C
6. link: Copy what you said
7. list: Today | rows: > Claude — 1:52 PM; Mail — 11:05 AM; Slack — 10:30 AM; Claude — 9:41 AM; Terminal — 8:55 AM; Notes — 8:10 AM | column: side
8. list: This dictation | rows: App — Claude; Cleanup — Light; Rewording — Off; Release to paste — 0.33 s; Length — 25 words · 0:24 | column: inspector
States:
- Empty: First run, nothing dictated yet. "Hold Right Command and say something. It lands here, with what you said underneath."
- Loading: none; history is on this Mac.
- Error: none.
- First run: the practice dictation from onboarding is the first row.

## Screen: Dictionary
Job: Teach Youch! the names Walker says, and see what it has learned from his fixes.
Primary action: Add
Chrome: sidebar
Fold: the field, Pramand with its clips, and the Learned list fit above the fold.
Signature: the clip discs: up to five voice clips per term, filled for each one recorded.
Content:
1. field: Add a name or term | placeholder: Pramand, Zelcor, Priya Raman
2. action: Add
3. list: Terms | rows: > Pramand — ~~prominent~~ ~~pro mand~~ · heard as promand — 3 of 5 clips; Zelcor — ~~sell core~~ · heard as zelkor — 1 of 5 clips; Priya Raman — no clips yet — Record
4. callout: Record yourself saying a term 3 to 5 times, 4 seconds at most each. Everyday words like "prominent" are never swapped on their own. | tone: info
5. list: Learned from your fixes | rows: ~~Zelcore~~ → Zelcor — Nov 15 — Remove | column: inspector
6. list: Snippets | rows: "my address" — 123 Main St · 1 more line; "my signature" — Best, · 2 more lines; "thumbs up" — Sounds good, thanks! | column: inspector
States:
- Empty: "Names you say often go here. Add one and record it three times."
- Loading: none.
- Error: a clip that is too quiet: "Didn't catch that. Try again a little closer."
- First run: Pramand from onboarding is the first term.

## Screen: Insights
Job: Show how Walker thinks out loud this week, in one number and one shape.
Primary action: none
Chrome: sidebar
Fold: the words numeral, the week's figures and the lost-thread moment sit above the fold; the area graph is in mocks/insights.html.
Signature: none (the area graph is the screen's one shape)
Content:
1. hero-numeral: 7,719 | label: Words, last 7 days
2. text: 51 minutes of talking across 40 dictations. | muted: yes
3. segmented: Range | options: 7 days; 30 days; All | selected: 7 days
4. text: Release to paste 0.44 s · Lost threads 17 · Streak 3 days · Typing saved ≈ 2.4 h
5. text: Lost threads happen mostly in dictations over 3 minutes, around 9 AM. | muted: yes
6. card: "and then the second thing is, um, what was the second thing" | meta: Yesterday, 4:20 PM · Notes
States:
- Empty: "Talk for a few days and your patterns show up here."
- Loading: none.
- Error: none.
- First run: the week's numeral with one dictation.

## Screen: Recordings
Job: Read a meeting as who said what, and name the speakers once.
Primary action: Export
Chrome: sidebar
Fold: the title, speakers and the first four turns sit above the fold.
Signature: the speaker discs and the strip of who held the floor.
Content:
1. text: Weekly sync, launch week | size: large
2. text: Today at 5:05 PM · 38:00 · 4 speakers · zoom_0.m4a | muted: yes
3. chord: Who spoke | items: You = 14 = #8290c7; Sarah = 11 = #6e79a7; Speaker 3 = 9 = #596287; Speaker 4 = 4 = #474e6b | labels: inside
4. list: Transcript | rows: You — Thanks for joining. Let's start with the launch checklist. — 0:04; Sarah — The store listing is ready. I still need the final screenshots from design. — 0:20; You — Dev, can you get those to her by Friday? — 0:42; Speaker 3 — Yes. I'll export them tonight and send the folder in the morning. — 0:49
5. text: Speaker 3 sounds like Dev. Not set until you say so. | muted: yes
6. link: Yes, it's Dev
7. action: Export | meta: Text, subtitles or Markdown
8. list: Today | rows: Northwind call — 7:53 PM; > Weekly sync — 5:05 PM | column: side
9. progress: Northwind call | value: 0.64 | meta: 64% | column: side
States:
- Empty: "Drop a meeting or interview here. It never leaves this Mac."
- Loading: a recording being transcribed shows its percentage in the list.
- Error: "Couldn't read this file. Try an audio or video file."
- First run: the drop zone and Watch a folder.

## Screen: Settings
Job: Set the key, the two dials and the basics, then get out.
Primary action: none
Chrome: sidebar
Fold: the dictation key, Cleanup and Rewording sit above the fold.
Signature: the dictation key drawn as a keycap.
Content:
1. segmented: Dictation key (hold to talk) | options: Fn; Right Option; Right Command | selected: Right Command
2. segmented: Cleanup: how much Youch! tidies what you said | options: Light; Medium; Heavy | selected: Light
3. segmented: Rewording: how far Youch! may reword | options: Off; Low; High | selected: Off
4. segmented: Appearance | options: Light; Dark; Match system | selected: Light
5. toggle: Fix spoken corrections at Light too | on: yes | meta: "Eight, no wait, five" becomes "five".
6. toggle: Show the Youch! button | on: yes | meta: A small button at the bottom of the screen.
7. toggle: Launch at login | on: no
8. list: Models, on this Mac | rows: Speech model — Parakeet TDT 0.6B v2 — 464 MB · Ready; Vocabulary model — Parakeet CTC 110M — 103 MB · Ready; Cleanup model — Qwen3 1.7B — 1.4 GB · Ready; Speaker model — diarization — 129 MB · Download | column: inspector
States:
- Empty: none.
- Loading: none.
- Error: a model download that failed: "Download stopped. Try again" in ink with an icon.
- First run: none.

## Screen: Welcome
Job: Say what Youch! is in one line and start setup.
Primary action: Get started
Chrome: none
Fold: everything.
Signature: the hold-to-talk key, drawn as a keycap.
Content:
1. title: Youch!
2. text: Speech-to-text that just works. Locally.
3. text: Hold Right Command, say it, let go. Youch! pastes it where you're typing.
4. text: Youch! uses models that run on this Mac (2.1 GB). You choose when they download, on the next screen. | muted: yes
5. action: Get started
6. progress: Step 1 of 8 | value: 0.125 | meta: Welcome
States:
- Empty: none.
- Loading: none.
- Error: none.
- First run: this is the first run.

## Screen: Try it
Job: Let Walker dictate once into a practice box and see it work.
Primary action: Finish
Chrome: none
Fold: everything.
Signature: the practice box filling with what he said.
Content:
1. title: Try it
2. text: Hold Right Command and say something, then let go. Your words land on the line below.
3. text: Your first dictation lands here as a talk line, then as text. | muted: yes
4. progress: Downloading models | value: 0.42 | meta: 42% · less than a minute left
5. action: Finish | pin: bottom
6. link: Skip practice
States:
- Empty: the empty practice box.
- Loading: models still downloading; Finish waits until they are ready.
- Error: "Didn't catch anything. Hold the key a little longer."
- First run: this is the first run.
