# Rollback — round 6

Every phase of round 6 is one commit (or a short run of commits) ending in a git tag. To undo, pick the
last tag you are happy with.

## Tags
| Tag | State |
|-----|-------|
| `r6-0-baseline` | Before round 6: 36 aesthetics incl. the adversarial-review fixes (commit 115b10e). |
| `r6-2-blend` | Blend engine + scaffold for 12 new aesthetics (new ones partly built at this point; existing 36 unchanged). |
| `r6-3-new-aesthetics` | The 12 new aesthetics built and all 48 on the framework hooks (commit 2422d9f). |
| `r6-5-harsh-fixes` | Harsh-review fixes for all 48 plus the shared pattern/font batch (same commit as `r6-3-new-aesthetics`, 2422d9f). |
| `r6-6-qc` | Severe QC done: framework cleanup (8d7fb49), QC fixes for all 48, shared batch 2, final sweep (10db8ca). |
| `r6-final` | Final gate passed and Mac app rebuilt (commit bb6f996). |

## Commit map (round 6, oldest first)
| Commit | Phase | Undo just this with |
|--------|-------|---------------------|
| 97e3b94 | Blend engine, scaffold, harsh reviews, research | `git revert 97e3b94` (also removes the 12 new aesthetics' registration) |
| fd4eb84 | Harsh fixes for 36 + 6 new aesthetics | `git revert fd4eb84` |
| d6817f4 | Last 6 new aesthetics | `git revert d6817f4` |
| 96438f8 | Framework hooks (native product/do-don't slides, colourways) | `git revert 96438f8` |
| 83573af | Sidebar motifs for new aesthetics | `git revert 83573af` |
| aeaa69a | Shared batch 1 (suites, fonts) | `git revert aeaa69a` |
| 2422d9f | Hook adoption + cleanup, all 48 | `git revert 2422d9f` |
| 8d7fb49 | Framework cleanup (safe hooks, export, blend legibility) | `git revert 8d7fb49` |
| a840d8d · da11fde · 1476908 · 9b7339b · 7337eeb · 11ef5d1 | QC fixes per aesthetic group | `git revert <hash>` |
| c269f41 | Shared batch 2 (QC suites, fonts) | `git revert c269f41` |
| c982416 · 10db8ca | Final sweep + hud/toner colourways | `git revert 10db8ca c982416` |
| 73b0664 · bb6f996 | Final gate: acid/xerox export, blend deck fit, blend probe fix | `git revert bb6f996 73b0664` |

Later commits depend on earlier ones (e.g. QC fixes use the 8d7fb49 helpers), so reverting an early commit
alone can conflict; prefer `git reset --hard <tag>` for whole-phase rollback.

## Turning features off without git
- **Blend:** set `const BLEND_ENABLED = false;` at the top of `js/blend.js`. The control disappears and every
  surface ignores blends; saved brands keep their blend data. Full removal steps: `docs/blend.md`.
- **One aesthetic:** delete its `<link>` and `<script>` lines in `index.html` (its brands then load with the
  default aesthetic).

Run `git tag` for the full list; every tag must have a line in the table above. Tags added after this table was written are listed by `git tag -n1`.

## How to roll back
Everything is local git (no remote). From the project folder:

```bash
git log --oneline --decorate | head -20
```

**Throw away everything after a tag** (destructive — commits after it are dropped):
```bash
git reset --hard r6-0-baseline
```

**Undo one phase but keep later ones** (safe — adds a new commit that reverses it):
```bash
git revert --no-edit <first-commit-of-phase>^..<last-commit-of-phase>
```

**Restore just one aesthetic to how it was at a tag** (e.g. xerox):
```bash
git checkout r6-0-baseline -- js/aesthetics/xerox.js css/aesthetics/xerox.css
```

After any rollback, rebuild the Mac app so /Applications matches:
```bash
cd mac && ./build.sh
```
