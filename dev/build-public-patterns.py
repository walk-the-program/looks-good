#!/usr/bin/env python3
"""Regenerate patterns-library/catalog.json and patterns-library/thumbs/ from the
local Ptrn mirror (ptrn/catalog.json + ptrn/_studio/thumbs), keeping ONLY entries
with source == "mine". Third-party tools (source "ptrn") are never copied.
Run from anywhere:  python3 dev/build-public-patterns.py"""
import json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ptrn"
OUT = ROOT / "patterns-library"

cat = json.loads((SRC / "catalog.json").read_text())
mine = [t for t in cat if t.get("source") == "mine"]
if not mine:
    sys.exit("no source=mine entries in ptrn/catalog.json")

(OUT / "thumbs").mkdir(parents=True, exist_ok=True)
keep = set()
out = []
for t in mine:
    m = re.fullmatch(r"/ptrn/studio/index\.html\?p=([a-z0-9_-]+)", t["href"])
    if not m:
        sys.exit("unexpected href for a 'mine' entry: " + t["href"])
    key = m.group(1)
    thumb = SRC / "_studio" / "thumbs" / (key + ".jpg")
    if not thumb.is_file():
        sys.exit("missing thumbnail: " + str(thumb))
    shutil.copyfile(thumb, OUT / "thumbs" / thumb.name)
    keep.add(thumb.name)
    out.append({**t,
                "href": "patterns-library/studio/index.html?p=" + key,
                "art": "patterns-library/thumbs/" + thumb.name})

for f in (OUT / "thumbs").glob("*.jpg"):   # drop thumbs no longer in the catalog
    if f.name not in keep:
        f.unlink()
(OUT / "catalog.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(f"{len(out)} owner patterns written to {OUT / 'catalog.json'}")
