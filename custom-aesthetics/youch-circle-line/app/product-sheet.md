# Product: Youch!
Platform: mac
Purpose: Hold a key, talk, and your words land where you're typing. It runs on this Mac, tidies what you said and never rewrites it.
Core action: Hold Right Command, talk, release.
Tabs: History, Dictionary, Insights, Recordings, Settings

## Screen: History
Job: Find a past dictation, compare what was pasted with what you said, and fix a word once so Youch! learns it.
Primary action: Replay audio
Chrome: sidebar
Fold: The list and the opened dictation fit in the window; the What you said card starts above the fold.
Signature: the selected row
Content:
1. title: History | highlight: History
2. list: Today | rows: > Claude — 2:14 PM — 312 words · 2 min; Mail — 11:40 AM — 141 words · 55 sec; Messages — 9:30 AM — 24 words · 9 sec
3. action: Replay audio | meta: 2:08
4. card: Claude · 2:14 PM | meta: 312 words · 2 min · Light | body: So the plan for Pramand is to ship the dictionary first. Then history, then the cleanup dial.
5. card: What you said | body: ~~um~~ so the plan for prominent is to ~~uh~~ ship the dictionary first, oh actually I meant Pramand. Then history, then the cleanup dial.
6. callout: Learned: prominent → Pramand. Youch! spells it that way from now on. | tone: success | action: Undo
States:
- Empty: No dictations yet. One line: hold Right Command and talk; the first one shows up here.
- Loading: none; everything is on this Mac.
- Error: Audio missing for an old dictation: the text stays, Replay is disabled with a one-line reason.
- First run: same as Empty.

## Screen: Settings
Job: Choose how much Youch! tidies and rewords, and the few switches that change how it behaves.
Primary action: none
Chrome: sidebar
Fold: Both dials and the three switches fit in the window.
Signature: the chosen level on the Cleanup dial
Content:
1. title: Settings | highlight: Settings
2. segmented: Cleanup | options: Light; Medium; Heavy | selected: Light
3. text: Light removes fillers and fixes punctuation. Nothing else changes. | muted: yes
4. segmented: Rewording | options: None; Low; Medium; High | selected: None
5. toggle: Show the Youch! button | on: yes | meta: A small button at the bottom of the screen. Click it to start or stop dictating.
6. toggle: Fix spoken corrections at Light too | on: no | meta: Medium and Heavy always do this. “Eight, no wait, five” becomes “five”.
7. toggle: Launch at login | on: yes
8. list: Styles by app | rows: Claude — Light; Mail — Medium; Messages — Light
9. action-secondary: Export everything | meta: Into a folder you can read without Youch!
States:
- Empty: none.
- Loading: none.
- Error: A model failed to load: ink icon and one line under Models, never red.
- First run: none.

## Screen: Insights
Job: Show how you think out loud: how much you've said, when you lose the thread, and your filler habits.
Primary action: none
Chrome: sidebar
Fold: The numeral, the range and the thread chart fit in the window.
Signature: the Words so far numeral
Content:
1. title: Insights | highlight: Insights
2. hero-numeral: 48,210 | label: Words so far | meta: +3,904 this week
3. segmented: Time range | options: 7 days; 30 days; All | selected: 7 days
4. chart: When you lose the thread | points: 0,1,0,2,3,1,0,0,2,4,1,0
5. stats: Filler habits | items: um = 41; like = 27; you know = 12
6. list: By app | rows: Claude — 31,402 words; Mail — 9,118 words; Messages — 4,530 words
7. text: Longer dictations are where threads usually go. | muted: yes
States:
- Empty: Fewer than 3 dictations: one line saying insights start after a few dictations.
- Loading: none; worked out on this Mac.
- Error: none.
- First run: same as Empty.
