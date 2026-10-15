#!/usr/bin/env python3
"""dev/vendor-fonts.py - copies every Google Font the app uses into fonts/ so it works offline.

Reads the FONTS list in js/data.js (plus the UI faces in UI_FAMILIES below), asks the
Google Fonts css2 API for each family exactly the way app.js does (same weights, italics
and variable axes as googleFamilyParam), keeps the latin subset, downloads the woff2
files into fonts/files/ and writes fonts/fonts.css with local @font-face rules.

The app loads fonts/fonts.css first and only falls back to Google Fonts for a family that
is missing from it, so re-run this after adding a font to FONTS:

    python3 dev/vendor-fonts.py            # fetch everything, rewrite fonts/
    python3 dev/vendor-fonts.py --check    # exit 1 if a FONTS family is missing locally

Only fonts.googleapis.com and fonts.gstatic.com are contacted. The fonts are licensed
under the SIL Open Font License or Apache 2.0 (see fonts/CREDITS.txt, written by
dev/font-credits.swift from each file's own name table).
"""
import hashlib
import os
import re
import sys
import urllib.parse
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'fonts')
FILES = os.path.join(OUT, 'files')
# A current desktop browser UA: Google serves woff2 with unicode-range subsets to it.
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')
# Faces the app's own interface uses (index.html), merged with FONTS by name.
UI_FAMILIES = [{'name': 'Geist', 'weights': '400;500;600;700'},
               {'name': 'Geist Mono', 'weights': '400;500'}]


def read_fonts():
    src = open(os.path.join(ROOT, 'js', 'data.js'), encoding='utf-8').read()
    block = src[src.index('const FONTS = ['):]
    block = block[:block.index('\n];')]
    fonts = []
    for line in block.splitlines():
        m = re.search(r"\{\s*name:\s*'([^']+)'", line)
        if not m:
            continue
        f = {'name': m.group(1)}
        for key in ('weights', 'ital'):
            km = re.search(key + r":\s*'([^']*)'", line)
            if km:
                f[key] = km.group(1)
        am = re.search(r"axes:\s*\{([^}]*)\}", line)
        if am:
            f['axes'] = dict(re.findall(r"(\w+):\s*'([^']*)'", am.group(1)))
        fonts.append(f)
    return fonts


def merged_families():
    fams = {f['name']: dict(f) for f in read_fonts()}
    for ui in UI_FAMILIES:
        if ui['name'] in fams:
            have = set(fams[ui['name']].get('weights', '400;700').split(';'))
            have |= set(ui['weights'].split(';'))
            fams[ui['name']]['weights'] = ';'.join(sorted(have, key=int))
        else:
            fams[ui['name']] = dict(ui)
    return [fams[k] for k in sorted(fams)]


def family_param(font):
    """Python port of googleFamilyParam() in js/data.js."""
    name = urllib.parse.quote(font['name']).replace('%20', '+')
    w = sorted(int(x) for x in str(font.get('weights') or '400;700').split(';') if x)
    axes = font.get('axes') or {}
    extra = list(axes)
    if not font.get('ital') and not extra:
        return 'family=%s:wght@%s' % (name, ';'.join(map(str, w)))
    order = (['ital'] if font.get('ital') else []) \
        + sorted([t for t in extra if t == t.lower()] + ['wght']) \
        + sorted(t for t in extra if t != t.lower())

    def tup(ital, wght):
        return ','.join(str(ital) if t == 'ital' else str(wght) if t == 'wght' else axes[t] for t in order)
    ital_w = sorted(int(x) for x in str(font.get('ital') or '').split(';') if x)
    tuples = [tup(0, n) for n in w] + [tup(1, n) for n in ital_w]
    return 'family=%s:%s@%s' % (name, ','.join(order), ';'.join(tuples))


def get(url):
    host = urllib.parse.urlparse(url).hostname
    if host not in ('fonts.googleapis.com', 'fonts.gstatic.com'):
        raise ValueError('refusing to fetch from ' + str(host))
    # curl, not urllib: the python.org Python ships without the system certificates.
    return subprocess.run(['curl', '-fsSL', '--max-time', '60', '-A', UA, url],
                          check=True, capture_output=True).stdout


def latin_blocks(css):
    """[(comment, block)] for every @font-face; keeps the latin subset when one is labelled."""
    parts = re.findall(r'(?:/\*\s*([\w-]+)\s*\*/\s*)?(@font-face\s*\{[^}]*\})', css)
    latin = [p for p in parts if p[0] == 'latin']
    return latin or parts


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def main():
    check = '--check' in sys.argv
    fams = merged_families()
    if check:
        css = open(os.path.join(OUT, 'fonts.css'), encoding='utf-8').read() if os.path.exists(os.path.join(OUT, 'fonts.css')) else ''
        have = set(re.findall(r"font-family:\s*'([^']+)'", css))
        missing = [f['name'] for f in fams if f['name'] not in have]
        print('missing locally: ' + (', '.join(missing) or 'none'))
        sys.exit(1 if missing else 0)

    os.makedirs(FILES, exist_ok=True)
    rules, saved, total, failed = [], {}, 0, []
    for f in fams:
        url = 'https://fonts.googleapis.com/css2?%s&display=swap' % family_param(f)
        try:
            css = get(url).decode('utf-8')
        except Exception as e:  # one bad family must not stop the rest
            failed.append('%s (%s)' % (f['name'], str(e)[:80]))
            continue
        for _, block in latin_blocks(css):
            src = re.search(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', block)
            if not src:
                continue
            remote = src.group(1)
            if remote not in saved:
                data = get(remote)
                ext = os.path.splitext(urllib.parse.urlparse(remote).path)[1] or '.woff2'
                fname = '%s-%s%s' % (slug(f['name']), hashlib.sha1(remote.encode()).hexdigest()[:8], ext)
                with open(os.path.join(FILES, fname), 'wb') as fh:
                    fh.write(data)
                saved[remote] = fname
                total += len(data)
            local = block.replace(remote, 'files/' + saved[remote])
            rules.append(local)
        print('%-28s ok' % f['name'])

    # Drop files left over from an earlier run.
    keep = set(saved.values())
    for name in os.listdir(FILES):
        if name not in keep:
            os.remove(os.path.join(FILES, name))

    head = ('/* fonts.css - local copies of the Google Fonts the app uses (latin subset).\n'
            '   Generated by dev/vendor-fonts.py; do not edit by hand. Licences: fonts/CREDITS.txt. */\n')
    with open(os.path.join(OUT, 'fonts.css'), 'w', encoding='utf-8') as fh:
        fh.write(head + '\n'.join(rules) + '\n')
    print('\n%d families, %d files, %.1f MB' % (len(fams) - len(failed), len(saved), total / 1e6))
    if failed:
        print('FAILED: ' + '; '.join(failed))
        sys.exit(1)


if __name__ == '__main__':
    main()
