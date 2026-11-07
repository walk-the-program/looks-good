#!/usr/bin/env bash
# Regenerate docs/aesthetic-spec/moves.md from the live move catalog. Run from anywhere.
set -eu
cd "$(dirname "$0")/.."
{ printf '%s\n' '<!-- Generated: run `dev/aesthetic-spec-catalog.sh` (or `node dev/aesthetic-check.js --list-moves`). Do not edit by hand. -->' ''
  node dev/aesthetic-check.js --list-moves; } > docs/aesthetic-spec/moves.md
echo "wrote docs/aesthetic-spec/moves.md ($(wc -l < docs/aesthetic-spec/moves.md) lines)"
