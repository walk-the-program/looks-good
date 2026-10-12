# Rollback — round 6

Every phase of round 6 is one commit (or a short run of commits) ending in a git tag. To undo, pick the
last tag you are happy with.

## Tags
| Tag | State |
|-----|-------|
| `r6-0-baseline` | Before round 6: 36 aesthetics incl. the adversarial-review fixes (commit 115b10e). |
| `r6-2-blend` | Blend engine + scaffold for 12 new aesthetics (new ones partly built at this point; existing 36 unchanged). |

## Turning features off without git
- **Blend:** set `const BLEND_ENABLED = false;` at the top of `js/blend.js`. The control disappears and every
  surface ignores blends; saved brands keep their blend data. Full removal steps: `docs/blend.md`.
- **One aesthetic:** delete its `<link>` and `<script>` lines in `index.html` (its brands then load with the
  default aesthetic).

(Further tags are added here as each phase lands.)

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
