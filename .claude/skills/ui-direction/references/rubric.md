# Taste rubric and review format

## Contents
1. How the critic works
2. The ten criteria, with anchors
3. Severity of fixes
4. The pass bar
5. Calibration: a round that failed
6. Review file format

## 1. How the critic works

The critic is a fresh agent that did not make the work. It scores what is on screen, not what the
author meant. It reads `app/direction.md` to learn the claim, then every PNG of the round, then
scores. It reads earlier reviews only after scoring, to check that their fixes landed.

Scores are whole numbers from 1 to 5. A 4 means you would show the screen to a strong product
designer without apologising for it. A 5 means they would ask who made it. Give a 3 when you are
unsure between 3 and 4: an inflated score is how cheap work reaches the owner.

Score each criterion against its anchors for the round as a whole. A 3 means the anchor's 3
describes the round. One fixable flaw in otherwise strong work is a fix, not a lower score: list it
as P2 when it sits in a key screen's first read, P3 otherwise. A P2 still blocks the pack, so
nothing slips through; the scores just stay honest across rounds.

Every score carries evidence: the PNG file name and what on it earned the score, in one or two
sentences. "Looks good" is not evidence; "collection-light.png: the six accord strips are the first
read, house names sit small above them" is.

## 2. The ten criteria, with anchors

Each criterion lists what a 1, a 3 and a 5 look like. A 2 sits between 1 and 3, a 4 between 3 and 5.

**thesis**: the direction's thesis reads from the screens.
- 1: You could not guess the thesis from the screens.
- 3: It shows on one screen, or only in the kit.
- 5: Every screen argues it; a stranger could state it after one look.

**signature**: one memorable thing, born from the product.
- 1: Nothing to remember, or the "signature" is a material (soft tiles, hairlines, a pill shape).
- 3: A signature exists but is decoration, or could belong to any app.
- 5: It comes from the product's content or core action, sits where it matters, and you would
  describe the app by it.

**content**: the product's data is drawn as itself. Where a mock covers a screen, judge content on the
mock: the renderer only draws the blocks the product sheet has, and a style can change how things look,
never what data the sheet carries. Never ask for a move that draws data the sheet does not hold.
- 1: Data shown raw: numbers in tiles, glyph stars, "label: value" lists, the data model on screen.
- 3: Some content is shaped, but the main object is still generic.
- 5: The main objects take forms that say what they are; reading them is faster and nicer than a
  plain list.

**hierarchy**: the squint test.
- 1: Everything has the same weight; there is no first read.
- 3: A first read exists, but the second and third levels blur, or the primary action fights the
  content.
- 5: One first read per screen, clear second and third, groups made by spacing, the primary action
  where the platform expects it.

**type**: voice and scale.
- 1: A reflex font with no reason, a flat scale, tracked caps everywhere.
- 3: A reasoned font, but weak scale contrast or muddy roles.
- 5: Fonts chosen for this product's voice, a scale with real contrast, each style (size, weight,
  case) does one job, numerals tabular where they line up.

**colour**: colour has a job.
- 1: Colour sprinkled as paint, or missing where the product needs it.
- 3: A strategy, applied unevenly or weak in one mode.
- 5: One clear strategy, the budget kept, both modes designed (dark is not inverted light),
  contrast holds.

**restraint**: one coherent language.
- 1: Many ideas competing, or no idea at all.
- 3: One language with stray outliers: a second radius family, a random shadow, a box around
  everything.
- 5: Every element earns its place; nothing decorative, nothing missing.

**craft**: the details.
- 1: Misalignment, uneven gaps, clipped text, invisible states.
- 3: Clean but mechanical: equal gaps everywhere, weak selected and focus states, no optical
  adjustment.
- 5: One strong edge, spacing rhythm that groups, consistent radii, states readable in both modes,
  nothing clipped above the fold.

**distinct**: not generic.
- 1: With the name hidden it passes for a default template, or a built-in style with a new accent.
- 3: Distinct in one place, default elsewhere.
- 5: Recognisably this product; no unargued default from the ledger on a key screen.

**owner-fit**: the owner's recorded taste (`owner-taste.md`).
- 1: Repeats something the owner killed.
- 3: Neutral against the owner's notes.
- 5: Answers the owner's own words and avoids every recorded dislike.

## 3. Severity of fixes

- **P1** blocks the round: a key screen looks cheap or generic; the thesis or signature is missing;
  the main content is drawn raw; a look the owner killed is back; content is unreadable or clipped
  above the fold; a P1 or P2 fix from the previous review did not land.
- **P2** must be fixed before the pack: any criterion at 3; an unargued ledger default visible on a
  key screen; a state invisible in one mode; a mock and the rendered kit disagree.
- **P3** polish that can wait.

Each fix names one target and one change, so the author can do it in one move:
`"collection: accord strips are 6px; make them the row's full height so they read before the names"`.

## 4. The pass bar

A round passes when every criterion scores 4 or 5, no fix is P1 or P2, and `verdict` is `"pass"`.
The pack gate also needs at least three rounds, a critic review for every round, and the latest
review written after that round's PNGs.

## 5. Calibration: a round that failed

Scent Box round 2 (`custom-aesthetics/scent-box-clean/app/renders/r2/`, 2026-11-15). The owner
called it "really cheap and not thought out at all". Honest scores:

| Criterion | Score | Why |
| --- | --- | --- |
| thesis | 1 | "Soft tiles on a quiet ground" is a material; nothing about fragrance shows. |
| signature | 1 | Nothing to remember; the product's own feature (each scent's accords in colour) is absent. |
| content | 1 | Accords as "TOBACCO 100", ratings as glyph stars, the notes pyramid as one run-on line. |
| hierarchy | 2 | Six identical grey boxes; the Add button is a black slab in the middle of the content. |
| type | 2 | DM Sans for everything; tracked caps on every label; names and body the same size. |
| colour | 1 | Warm grey and black only; colour is missing exactly where the product needs it. |
| restraint | 3 | Consistent, but only because there is almost nothing there. |
| craft | 3 | Aligned, but equal gaps everywhere, an arrow on Save, a Mac window drawn as a phone column. |
| distinct | 1 | With the name hidden it is any template. |
| owner-fit | 1 | "Simpler" was read as "remove the ideas", which is the bland the owner keeps rejecting. |

## 6. Review file format

The critic writes `app/reviews/r<n>.json` (UTF-8 JSON, no comments). Keys, in order:

- `round`: the round number, equal to `<n>`.
- `reviewer`: `"critic"`.
- `date`: `YYYY-MM-DD`.
- `renders`: `"app/renders/r<n>/"`.
- `scores`: one entry per criterion key (`thesis`, `signature`, `content`, `hierarchy`, `type`,
  `colour`, `restraint`, `craft`, `distinct`, `owner-fit`), each `{ "score": 1-5, "evidence": "..." }`.
  Every evidence string names at least one PNG from this round's folder.
- `generic`: the three most generic things on screen, as strings, even in a passing round.
- `fixes`: `[{ "id": "f1", "priority": "P1|P2|P3", "target": "...", "text": "..." }]`. Ids are unique
  within the file.
- `landed`: ids of the previous review's fixes that did land (empty in round 1).
- `verdict`: `"pass"` or `"refine"`.

Round 1 renders three directions into `app/renders/r1/a/`, `r1/b/` and `r1/c/`. Its review replaces
`scores` with `directions`, one entry per subfolder, each holding its own `scores`, and adds
`chosen` (`"a"`, `"b"`, `"c"`, or a merge such as `"b+c"`) with `why`. Round 1 has no pass bar; its
job is to find the strongest direction.

```json
{
  "round": 2,
  "reviewer": "critic",
  "date": "2026-11-16",
  "renders": "app/renders/r2/",
  "scores": {
    "thesis":    { "score": 4, "evidence": "collection-light.png: the shelf reads as rows of accord strips first, names second." },
    "signature": { "score": 3, "evidence": "fragrance-detail-light.png: the accord chord is there but sits below the fold." }
  },
  "generic": ["stat tiles on the detail screen", "DM Sans body", "full-width Save"],
  "fixes": [
    { "id": "f1", "priority": "P2", "target": "fragrance-detail", "text": "Move the accord chord above the notes so it is the first read." }
  ],
  "landed": ["f3", "f4"],
  "verdict": "refine"
}
```

The example shows two of the ten scores to stay short; a real file has all ten.
