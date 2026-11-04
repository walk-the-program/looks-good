#!/bin/bash
# Starts Looks Good in your browser (Mac or Linux). Needs python3.
cd "$(dirname "$0")" || exit 1
if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 was not found. On a Mac, run: xcode-select --install"
  read -r -p "Press Return to close." _; exit 1
fi
exec python3 tools/serve.py "$@"
