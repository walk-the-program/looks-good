# Round 5 — ten more aesthetics (27–36)

Source of truth for direction: the cited research in
`docs/research/round5-27-31.md` and `docs/research/round5-32-36.md` (10–12 premium references per
aesthetic, signature mechanisms, type, brand-colour mapping, UI translation, SVG hero ideas,
pitfalls, distinctness). Builders read their aesthetics' sections in full and follow them; [K]/[R]
tagged items are proposals, [V]/[S] are sourced. Framework contract, hooks and the CAO quality bar:
`docs/aesthetics-plan.md` (Board anatomy, all rounds), `docs/aesthetics-round4.md` ("Quality bar"),
`docs/cao-review.md`. The deck must stay gore-free (`dev/deck-gore.js`, 0 issues).

## The ten

| # | key | Name | Descriptor | Mode | Family | Slide shape | Material label · states (statesKind) |
|---|-----|------|-----------|------|--------|-------------|---------------------------------------|
| 27 | corporate-vandalism | Corporate Vandalism | Official · Hijacked · Deadpan | light | Graphic | minimal | "Compliance" · Approved / Flagged / Redacted (button) |
| 28 | religious-futurism | Religious Futurism | Sacred · Luminous · Monumental | dark | Luminous | classic | "Relics" · Dormant / Lit / Consecrated (swatch) |
| 29 | xerox-punk | Xerox Punk | Ransom · Pasted · Defiant | dark | Print & editorial | minimal | "Paste-up" · Pasted / Circled / Crossed out (button) |
| 30 | acid-graphics | Acid Graphics | Toxic · Warped · Loud | dark | Luminous | minimal | "Signal" · Idle / Strobe / Melt (button) |
| 31 | cybersigilism | Cybersigilism | Thorned · Silver · Cold | dark | Luminous | minimal | "Sigils" · Etched / Lit / Bound (swatch) |
| 32 | industrial-hazard | Industrial Hazard | Heavy · Ranked · Locked-out | dark | Tactile | minimal | "Interlocks" · Normal / Caution / Danger (button) |
| 33 | radical-memphis | Radical Memphis | Laminate · Clashing · Springy | light | Graphic | soft | "Laminates" · Plain / Patterned / Stacked (swatch) |
| 34 | biomechanical-gothic | Biomechanical Gothic | Grown · Ribbed · Ancient | dark | Luminous | classic | "Organs" · Dormant / Breathing / Awake (swatch) |
| 35 | pirate-broadcast | Pirate Broadcast | Intercepted · Analog · Rogue | dark | Digital | minimal | "Signal" · Carrier / Tuned / Intrusion (button) |
| 36 | dystopian-luxury | Dystopian Luxury | Severe · Clinical · Exclusive | light | Print & editorial | minimal | "Accession" · Catalogued / Restricted / Classified (button) |

## Non-negotiables per aesthetic (from the research — read the full sections)

- **27 Corporate Vandalism:** the shell is sincere and pristine (client colours = the official
  brand shell); the vandal layer is fixed black/white/hazard red: redaction bars, warning labels,
  receipts, absurd fine-print footnotes, mundane buttons. One intrusion per screen. No grunge, no
  rotation, no distressed textures (that is Xerox Punk's job).
- **28 Religious Futurism:** gold + black (obsidian) + bone; gold is thin material (lines, rims,
  rings), never a fill. Client colours are the *light*: stained-glass panes (pixel-mosaic à la
  Richter: random squares from the palette, black leading) and halo light. Ogive arch panels, halo-
  ring progress, mandorla selection, liturgical small caps + tiny technical annotations. Slow and
  still (no motion needed).
- **29 Xerox Punk:** a dark wall of pasted collage (not a white copied page — that's Xerox):
  ransom-note headline tiles (each its own library face, ground, size, rotation; built from the
  brand's faces + contrast faces), torn wheatpaste layers, censor bars, marker circles / cross-
  outs / strike-throughs for states, misregistration, exactly ONE fluoro = client primary pushed to
  Day-Glo. See the research's 7-row Xerox vs Xerox Punk table and obey it.
- **30 Acid Graphics:** vibrating colour pairs (client primary dominant + a computed clash colour
  150–180° away at equal luminance), warped/stretched type, op-art ripple, dense info, ticket tabs,
  event strip, all over a hidden calm grid. Chrome only as a one-word accent (Y2K Chrome owns
  chrome). No DayGlo cliché soup.
- **31 Cybersigilism:** hairline tapered thorn branches as filled polygons (generate with a seeded
  L-system — recipe in the research), mirrored and architectural; silver fixed, client colour only
  as cold light/glow. Decorative lines 0.75–1.25px; a 16–24px clear zone — ornament never touches
  text. Corner-bracket thorn frames, thorn-tip progress, diamond toggles.
- **32 Industrial Hazard:** a heavy grey machine; colour is rationed (ISA-101): healthy = grey,
  colour only for abnormal states, using the fixed ANSI Z535 ladder (DANGER white-on-red, WARNING
  black-on-orange, CAUTION black-on-yellow, NOTICE white-on-blue). Client primary = machine enamel
  (housing paint). Hazard stripes (45°, equal bands) only on dangerous controls' edges. Serial
  numbers, lockout/tagout tags, oversized status lights, steel bezels.
- **33 Radical Memphis:** laminate-surface logic: pattern fills (Bacterio-type black/white
  squiggles, terrazzo, checker, dashes) bind the saturated colours; objects are stacked primitives
  on a diagonal stance; second-hue offset sheets, NO ink outlines (that's Neo-Brutal Pop), no
  Corporate-Memphis people.
- **34 Biomechanical Gothic:** one cast material + rhythm: a few repeated modules (rib, vertebra,
  tube, valve) in charcoal / bone / tarnished metal; client colour only as a dim bioluminescent
  glow. Vertebral arches, ribbed frames, tubing dividers, a "breathing" (static-safe) loader. No
  gore, no copyrighted Giger/Alien imagery.
- **35 Pirate Broadcast:** a rigid diagnostic frame (40×24 teletext grid, 8 colours, 3-digit page
  numbers, 4 colour buttons, test-card / SMPTE-bar elements each with a technical job) that gets
  intruded upon (interrupted overlays, timecode, chyrons, channel numbers, tuning + signal meters).
  Scanlines alone are not the style — structure and copy must behave like broadcast.
- **36 Dystopian Luxury:** severity by removal + labelling: tiny logo, vast whitespace, enormous
  severely-cropped type, surgical white / ink black, polished-metal hairlines, Margiela-style blank
  label with numbered circle, museum accession numbers (year.sequence.part), security-style
  labels; blood red single accent < 2% of area.

## Font recommendations (add to js/aesthetic-meta.js; picks must exist in FONTS)

New Google fonts to add (verify each css2 URL returns 200; new class `blackletter`):
Grenze Gotisch (400;700, blackletter), Pirata One (400, blackletter), Cinzel Decorative (400;700,
deco), Barlow Condensed (400;600;800, condensed), Share Tech Mono (400, mono).

| # | Heading → picks | Body → picks | Mono | Avoid | Pairings (first applied) |
|---|-----------------|--------------|------|-------|--------------------------|
| 27 | neo-grotesk, heavy → Inter Tight, Archivo Black, Archivo | neo-grotesk → Inter, Public Sans | IBM Plex Mono, Space Mono | soft-serif, groovy, deco, rounded | Inter Tight/Inter · Archivo Black/IBM Plex Sans · Archivo/Public Sans |
| 28 | deco, old-style, didone → Cinzel, Cinzel Decorative, Cormorant Garamond, Italiana | old-style, neo-grotesk → EB Garamond, Inter | DM Mono | groovy, pixel, rounded, heavy | Cinzel/EB Garamond · Cormorant Garamond/Inter · Cinzel Decorative/Cormorant Garamond |
| 29 | heavy, condensed → Archivo Black, Anton, Bebas Neue | typewriter → Special Elite, Courier Prime | Courier Prime | soft-serif, geometric, deco, rounded | Anton/Special Elite · Archivo Black/Courier Prime · Bebas Neue/Courier Prime |
| 30 | wide, heavy, techno → Unbounded, Dela Gothic One, Syne, Michroma | grotesk, neo-grotesk → Space Grotesk, Inter | Space Mono | serif (all), rounded, deco | Unbounded/Space Grotesk · Dela Gothic One/Inter · Syne/Space Mono |
| 31 | blackletter, wide, deco → Grenze Gotisch, Pirata One, Michroma, Cinzel | neo-grotesk → Inter, Geist | Geist Mono | rounded, groovy, heavy, pixel | Grenze Gotisch/Inter · Pirata One/Geist · Michroma/Inter |
| 32 | condensed → Barlow Condensed, Big Shoulders Display, Oswald, Anton | neo-grotesk → IBM Plex Sans, Inter | IBM Plex Mono, Azeret Mono | serif (all), rounded, groovy, deco | Barlow Condensed/IBM Plex Sans · Big Shoulders Display/IBM Plex Sans · Oswald/Inter |
| 33 | heavy, geometric, groovy → Archivo Black, Jost, Righteous, Outfit | geometric → DM Sans, Jost | — | text-serif, old-style, techno, pixel, mono | Archivo Black/DM Sans · Jost/Jost · Righteous/DM Sans |
| 34 | blackletter, deco, old-style → Grenze Gotisch, Cinzel, Cormorant Garamond, Italiana | text-serif, old-style → Spectral, EB Garamond | IBM Plex Mono | rounded, groovy, pixel, geometric | Grenze Gotisch/Spectral · Cinzel/EB Garamond · Cormorant Garamond/IBM Plex Sans |
| 35 | condensed, pixel, mono → Bebas Neue, VT323, Share Tech Mono, Oswald | mono → IBM Plex Mono, Share Tech Mono | VT323 | serif (all), rounded, groovy | Bebas Neue/IBM Plex Mono · VT323/Share Tech Mono · Oswald/IBM Plex Mono |
| 36 | neo-grotesk, didone → Inter Tight, Archivo, Bodoni Moda, Instrument Serif | neo-grotesk → Inter, Public Sans | IBM Plex Mono | groovy, rounded, pixel, techno, deco | Inter Tight/Inter · Bodoni Moda/Inter · Archivo/Public Sans |

Each entry also needs a one-sentence `why`, and `deck: { principles (3), do (3), dont (3) }`
authored per aesthetic (≤6 / ≤12 / ≤10 words). Pattern suites (fit.js): 6 entries each from the 53
families, chosen to fit (e.g. Corporate Vandalism → glyphgrid/onebit/parcels in mono; Religious
Futurism → specimens/oprings quiet/marble; Xerox Punk → tornbands/onebit/flyposter; Acid Graphics →
warpcheck/burst/neonspray; Cybersigilism → rods/flow/seafan in mono; Industrial Hazard →
chevron/relief/slipgrid; Radical Memphis → patchwork/panels/festival; Biomechanical Gothic →
seafan/tissue/colony at low tone; Pirate Broadcast → signal/satellite/typeterrain; Dystopian Luxury
→ modulargrid/halftone quiet mono).

## Process
| ID | Owner | Writes |
|----|-------|--------|
| P5 | Sonnet | fonts in js/data.js (+blackletter class), js/aesthetic-meta.js (10 entries), index.html tags, 10 stub defs + css, tile motifs, fit.js suites, harness count |
| B5a | Sonnet | 27–31 |
| B5b | Sonnet | 32–36 |
| CAO-5 | Opus | review of 27–36 (board + deck) → docs/cao-review.md "Round 5" |
| Y5 | Sonnet ×2 | CAO fixes; coordinator accepts; Mac build |
