#!/usr/bin/env python3
"""dev/sync-ptrn.py — refresh the private Ptrn mirror used by Patterns mode.

Copies ~/Desktop/Ptrn/site into ./ptrn (git-ignored on purpose: the mirrored tools are
someone else's work, not for publishing or version control), then:
  1. rewrites root-absolute asset paths (/_shared, /_fonts, /_studio, /favicon, /apple-touch)
     to /ptrn/... so the pages work from a subfolder and from app://local/;
  2. neutralizes the "framed means embed" auto-detect, so a tool inside Branding Designer's
     iframe keeps its full controls (an explicit ?embed still works);
  3. writes ptrn/catalog.json from the TOOLS array on the Ptrn homepage.

Re-runnable: the copy uses rsync --delete, so the result is the same every time.
Usage: python3 dev/sync-ptrn.py [--source PATH]
"""
import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / "ptrn"
DEFAULT_SOURCE = Path.home() / "Desktop" / "Ptrn" / "site"

PATH_RE = re.compile(r"""(["'(])/(_shared|_fonts|_studio|favicon|apple-touch)""")
FRAME_RE = re.compile(r"window\.self\s*!==\s*window\.top")
TOOLS_RE = re.compile(r"const\s+TOOLS\s*=\s*\[(.*?)\n\];", re.S)
ROW_RE = re.compile(r"^\s*\{(.*)\},?\s*$")
PAIR_RE = re.compile(r'(\w+)\s*:\s*(?:"((?:[^"\\]|\\.)*)"|(-?\d+))')


def file_href(href):
    """Point folder URLs at their index.html: the Mac app's file server doesn't
    resolve a directory to its index the way http.server does."""
    path, q, query = href.partition("?")
    if path.endswith("/"):
        path += "index.html"
    return path + q + query


def die(msg):
    print(f"sync-ptrn: {msg}", file=sys.stderr)
    sys.exit(1)


def copy_tree(src):
    DEST.mkdir(exist_ok=True)
    cmd = ["rsync", "-a", "--delete", "--exclude", ".DS_Store", f"{src}/", f"{DEST}/"]
    try:
        subprocess.run(cmd, check=True)
    except FileNotFoundError:
        die("rsync not found")
    except subprocess.CalledProcessError as e:
        die(f"rsync failed ({e.returncode})")


def transform():
    paths = frames = 0
    for f in DEST.rglob("*"):
        if not f.is_file() or f.suffix not in (".html", ".js", ".css"):
            continue
        text = f.read_text(encoding="utf-8")
        text, n = PATH_RE.subn(r"\1/ptrn/\2", text)
        text, m = FRAME_RE.subn("false", text)
        paths += n
        frames += m
        if n or m:
            f.write_text(text, encoding="utf-8")
    return paths, frames


def build_catalog():
    html = (DEST / "index.html").read_text(encoding="utf-8")
    block = TOOLS_RE.search(html)
    if not block:
        die("no TOOLS array found on the Ptrn homepage")
    rows = []
    for line in block.group(1).splitlines():
        m = ROW_RE.match(line)
        if not m:
            continue
        d = {}
        for key, s, n in PAIR_RE.findall(m.group(1)):
            d[key] = json.loads(f'"{s}"') if s or not n else int(n)
        if "slug" not in d:
            continue
        art = d.get("art", "")
        rows.append({
            "slug": d["slug"],
            "href": "/ptrn/" + file_href(d.get("href", d["slug"] + "/")),
            "name": d.get("name", d["slug"]),
            "cat": d.get("cat", ""),
            "desc": d.get("desc", ""),
            "art": "/ptrn/" + art if art else "",
            "released": d.get("released", ""),
            "source": d.get("source", "ptrn"),
        })
    (DEST / "catalog.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Ptrn site folder")
    src = ap.parse_args().source.expanduser()
    if not (src / "index.html").is_file():
        die(f"Ptrn source not found at {src} (pass --source PATH)")
    copy_tree(src)
    paths, frames = transform()
    rows = build_catalog()
    counts = Counter(r["source"] for r in rows)
    print(f"Synced {src} -> {DEST}")
    print(f"  {paths} paths rewritten, {frames} frame auto-detects neutralized")
    print(f"  catalog.json: {len(rows)} entries (" + ", ".join(f"{k} {v}" for k, v in sorted(counts.items())) + ")")


if __name__ == "__main__":
    main()
