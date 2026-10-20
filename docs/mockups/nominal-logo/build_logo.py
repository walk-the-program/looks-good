"""Builds the Nominal Studios logo SVGs with the type converted to outlines.

Geometry matches docs/mockups/nominal-logo.html (lockup A, stretched Studios), in
units where 1 em of NOMINAL = 1000:
  NOMINAL   Instrument Serif Regular, tracking -0.062em, cap top at y=0
  strip     y 610..780 (hides the bottom ~15% of the caps), x = word width
  STUDIOS   Inter Medium (wght 500, opsz 14), 0.118em, letters spread edge to edge,
            cap top 90 units below the strip
Needs: fonttools, brotli, uharfbuzz.  Run from the repo root:
  python docs/mockups/nominal-logo/build_logo.py
"""
import io
import os

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(ROOT, '..', '..', '..', 'fonts', 'files')
INK, WHITE = '#1C1F26', '#FFFFFF'

TRACK = -62          # NOMINAL letter-spacing, in serif units (1000/em)
CAP = 720            # Instrument Serif cap height
CROP, STRIP_H = 610, 170
ST_SIZE = 118        # Studios font size in serif units
ST_GAP = 90          # strip bottom -> Studios cap top


def load(name, **axes):
    font = TTFont(os.path.join(FONTS, name))
    if axes:
        font = instancer.instantiateVariableFont(font, axes)
    buf = io.BytesIO()
    font.flavor = None
    font.save(buf)
    data = buf.getvalue()
    return TTFont(io.BytesIO(data)), hb.Font(hb.Face(data))


def shape(hbfont, text):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {'kern': True, 'liga': False})
    return [(i.codepoint, p.x_advance, p.x_offset) for i, p in zip(buf.glyph_infos, buf.glyph_positions)]


class Ink:
    """Collects glyph outlines as one SVG path, placed with (scale, dx, baseline)."""

    def __init__(self):
        self.d, self.bounds = [], None

    def glyph(self, font, gid, scale, dx, baseline):
        gs = font.getGlyphSet()
        name = font.getGlyphOrder()[gid]
        # font y is up; SVG y is down
        t = (scale, 0, 0, -scale, dx, baseline)
        pen = SVGPathPen(gs)
        gs[name].draw(TransformPen(pen, t))
        self.d.append(pen.getCommands())
        bp = BoundsPen(gs)
        gs[name].draw(TransformPen(bp, t))
        self._grow(bp.bounds)

    def rect(self, x0, y0, x1, y1):
        self.d.append(f'M{x0:.2f} {y0:.2f}H{x1:.2f}V{y1:.2f}H{x0:.2f}Z')
        self._grow((x0, y0, x1, y1))

    def _grow(self, b):
        if not b:
            return
        if self.bounds is None:
            self.bounds = b
        else:
            a = self.bounds
            self.bounds = (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]))


def nominal(ink, serif, hserif, scale=1.0, x0=0.0, cap_top=0.0, text='NOMINAL'):
    """Draws the word with its cap top at cap_top; returns the word box width."""
    x = x0
    glyphs = shape(hserif, text)
    for i, (gid, adv, off) in enumerate(glyphs):
        ink.glyph(serif, gid, scale, x + off * scale, cap_top + CAP * scale)
        x += (adv + (TRACK if i < len(glyphs) - 1 else 0)) * scale
    return x - x0


def svg(ink, fill, bg=None, box=None, pad=0):
    x0, y0, x1, y1 = box or ink.bounds
    x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
    w, h = x1 - x0, y1 - y0
    back = f'<rect x="{x0:.2f}" y="{y0:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} {y0:.2f} {w:.2f} {h:.2f}" '
            f'width="{w:.0f}" height="{h:.0f}">{back}<path fill="{fill}" d="{"".join(ink.d)}"/></svg>\n')


def main():
    serif, hserif = load('instrument-serif-03435c64.woff2')
    inter, hinter = load('inter-01457da3.woff2', wght=500, opsz=14)
    k = ST_SIZE / inter['head'].unitsPerEm
    inter_cap = inter['OS/2'].sCapHeight

    # wordmark: NOMINAL + strip
    word = Ink()
    w = nominal(word, serif, hserif)
    word.rect(0, CROP, w, CROP + STRIP_H)

    # lockup: + STUDIOS spread across the word width (flex space-between)
    lock = Ink()
    nominal(lock, serif, hserif)
    lock.rect(0, CROP, w, CROP + STRIP_H)
    letters = [shape(hinter, c)[0] for c in 'STUDIOS']
    gap = (w - sum(a for _, a, _ in letters) * k) / (len(letters) - 1)
    base = CROP + STRIP_H + ST_GAP + inter_cap * k
    x = 0.0
    for gid, adv, off in letters:
        lock.glyph(inter, gid, k, x + off * k, base)
        x += adv * k + gap

    # monogram: N standing on a full-width strip, square tile of 1000
    T, s = 1000.0, 0.95
    mono = Ink()
    (gid, adv, _), = shape(hserif, 'N')
    strip_top = T - 0.24 * 1000 * s  # strip is .24em of the N size
    cap_top = strip_top - CROP * s
    # centre on the glyph's own outline (serif to serif), not its advance box
    bp = BoundsPen(serif.getGlyphSet())
    serif.getGlyphSet()[serif.getGlyphOrder()[gid]].draw(bp)
    gx0, _, gx1, _ = bp.bounds
    mono.glyph(serif, gid, s, (T - (gx1 - gx0) * s) / 2 - gx0 * s, cap_top + CAP * s)
    mono.rect(0, strip_top, T, T)
    tile = (0, 0, T, T)

    out = {
        'nominal-studios-logo.svg': svg(lock, INK),
        'nominal-studios-logo-white.svg': svg(lock, WHITE),
        'nominal-wordmark.svg': svg(word, INK),
        'nominal-wordmark-white.svg': svg(word, WHITE),
        'nominal-monogram.svg': svg(mono, INK, bg=WHITE, box=tile),
        'nominal-monogram-dark.svg': svg(mono, WHITE, bg=INK, box=tile),
    }
    for name, text in out.items():
        with open(os.path.join(ROOT, name), 'w') as f:
            f.write(text)
        print(name, len(text), 'bytes')
    print('word width', round(w, 1), 'lockup bounds', [round(v, 1) for v in lock.bounds])


if __name__ == '__main__':
    main()
