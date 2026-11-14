# Product: Youch!
Platform: mac
Purpose: Speech-to-text that just works. Locally. It tidies what you said and never rewrites it.
Core action: Hold the key, talk, release.
Tabs: History, Dictionary, Cleanup

## Screen: History
Job: Find a past dictation, see exactly what was said against what was pasted, and fix a word once so Youch! learns it.
Primary action: Replay audio
Chrome: sidebar
Fold: The list and the open dictation with its "What you said" fit in the 800 pt window.
Signature: the highlighter band on the selected row and on the fixed word
Content:
1. title: History | highlight: History
2. list: Today | rows: > Claude — 2:14 PM — 312 words · 2 min; Dia — 1:02 PM — 88 words · 38 sec; Mail — 11:40 AM — 141 words · 55 sec; Weekly sync with Sarah — 9:30 AM — 4,812 words · 32 min
3. card: Claude · 2:14 PM | meta: 312 words · 2 min | body: So the plan for Pramand is to ship the dictionary first. Then history, then the cleanup dial.
4. card: What you said | body: ~~um~~ so the plan for prominent is to ~~uh~~ ship the dictionary first, oh actually I meant Pramand. Then history, then the cleanup dial.
5. callout: Learned: prominent → Pramand. Youch! will now correct it in context. | tone: success | action: Undo
6. action: Replay audio | meta: 2:08

## Screen: Cleanup
Job: Choose how much Youch! tidies, per app, with every level an enforced rule set that cannot add words.
Primary action: Save
Chrome: sidebar
Fold: The dial, the per-app list and the toggles fit in the window.
Signature: the highlighter band on the chosen level
Content:
1. title: Cleanup | highlight: Cleanup
2. segmented: Cleanup dial | options: Light; Medium; Heavy | selected: Light
3. text: Light removes fillers and fixes punctuation. Nothing else changes. | muted: yes
4. list: Styles per app | rows: Claude — Light; Dia — Light; Mail — Medium; Messages — Medium
5. toggle: Faithfulness check | on: yes | meta: Every output word must come from what you said or the dictionary
6. toggle: Resolve spoken corrections | on: yes | meta: "oh, actually, I meant X"
7. toggle: Automatic lists and numbering | on: yes
8. action: Save | pin: bottom

## Screen: Dictionary
Job: Teach Youch! the names you say most by recording each one, and see what it has learned.
Primary action: Record pronunciation
Chrome: sidebar
Fold: The field, the word list and the learned callout fit in the window.
Signature: the highlighter band on the word being trained
Content:
1. title: Dictionary | highlight: Dictionary
2. field: Add a word | value: Pramand | placeholder: Type a name
3. stats: Pronunciations recorded | items: Recorded = 3; Needed = 5
4. action: Record pronunciation | meta: 3 of 5
5. list: Words | rows: Pramand — Heard as "prominent", "Promand" — 3 recordings; EndMean — Learned from your edits — 1 fix; Parakeet — Heard as "para keet" — 5 recordings
6. text: Fix a word in History and Youch! shows what it learned, with Undo. | muted: yes
7. card: Words heard wrong this week | meta: 2 | body: prominent, Promand
