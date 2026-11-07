# Aesthetic library and custom-style loading (2026-11-07)

Coordinator: main session (Opus). Workers: Sonnet, one at a time. Only the coordinator edits this file.

## Outcome

Custom aesthetics (spec v2 JSON) load in the normal app with no flag, sit next to the 45 built-ins in
every picker, and a new **Styles** home (a fourth mode beside Brands / Patterns / Logos) lets a studio
browse every style, import and export their own, duplicate, rename and delete them, and see a custom
style's round history. No AI box anywhere. The studio editor (dials, Variations, pinned notes) is a
later round and is out of scope here.

## Decisions

1. **Two homes for custom styles.**
   - `custom-aesthetics/<key>/` in the repo (aesthetic.json, art/, rounds.json), listed in
     `custom-aesthetics/index.json`. This is where an agent writes. Darkroom moves here from
     `dev/move-lab/specs/darkroom/`. Shown as source "folder"; it can't be deleted in the app.
   - Imported or duplicated styles live in `LibraryStore` collection `aesthetics` (IndexedDB in the
     browser, `~/Library/Application Support/Branding Designer/aesthetics/` in the Mac app). Source "mine".
2. **One file to share a style:** `<key>.aesthetic.json`, a bundle
   `{ "format": "looks-good-aesthetic", "version": 1, "aesthetic": {…spec 2…}, "rounds": {…}|null,
   "art": { "art/hero.svg": "<svg…>" | "data:image/…" } }`. Import also accepts a bare aesthetic.json
   (no art files). Imported content is untrusted.
3. **Loading is async.** The runtime and move files load always; the lab specs still need
   `?movelab=1`. `CustomAesthetics.ready` resolves once folder and stored styles are registered;
   `LibraryUI.init` waits for it (bounded) before showing brands, so a brand saved with a custom style
   restores it. Style pickers rebuild when the set changes.
4. Built-ins can't be duplicated, renamed or deleted (they aren't specs). Their library actions are
   "Use on a brand" and viewing.
5. A brand whose custom style is missing (deleted, or opened on another machine) falls back to the
   default style without errors.

## API contract (W1 provides, W2 uses)

```
window.CustomAesthetics = {
  ready,                         // Promise, never rejects
  list(),                        // [{ key, name, source: 'folder'|'mine', id|null, folder|null,
                                 //    updatedAt|null, hasRounds }]
  source(key),                   // 'builtin' | 'folder' | 'mine' | null
  rounds(key),                   // rounds.json object or null
  bundle(key),                   // Promise<bundle>
  exportFile(key),               // Promise; saves <key>.aesthetic.json (browser download / Mac save)
  importText(text, { onClash }), // Promise<{ ok, key, error }>; onClash(key) -> 'replace'|'copy'|'cancel'
  duplicate(key, { name }),      // Promise<{ ok, key, error }>; folder or mine -> new mine style
  rename(key, name),             // Promise<{ ok, error }>; mine only
  remove(key),                   // Promise<{ ok, error }>; mine only
  onChange(fn),                  // called after any add / remove / rename
}
```

## Tasks

| ID | Owner | Writes | Depends | State |
|----|-------|--------|---------|-------|
| W1 | Sonnet | loader, storage, runtime hardening, Mac collection + bundle copy, folder move, checker/docs paths, tests | none | accepted (46 styles, hostile-bundle tests, 0 console) |
| W2 | Sonnet | Styles home: markup, `js/styles-home.js`, `css/styles-home.css`, mode switch | W1 | accepted (shots in `shots/`) |
| V | Coordinator | browser checks, review, commit | W2 | accepted (lab specs counted as "lab", mode line fixed) |

## Not done here

- The Mac app was not rebuilt, so its `aesthetics` folder and the bundled `custom-aesthetics/` are
  type-checked only.
- "New brand" in Use on a brand waits (up to 8 s) for the editor to open, because
  `LibraryUI.newBrandFlow()` resolves before the brand exists.
- Next: the studio editor (dials, Variations, pinned notes writing `rounds.json`).
