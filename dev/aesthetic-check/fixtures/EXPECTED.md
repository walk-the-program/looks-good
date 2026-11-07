# Fixture expectations

Read by `node dev/aesthetic-check.js --self-test`. Each `## <folder>` lists the results the static checker
must give for `fixtures/<folder>/`. `FAIL <id>` / `WARN <id>`: that check line must appear. The set of FAIL ids
must equal the listed FAIL ids exactly. `CLEAN`: no FAIL and no WARN except `kit-unmapped` (the kit has
70 components; the fixtures map only a few, so that WARN is expected and ignored).

## valid
- CLEAN
Minimal valid aesthetic: scalar and {light,dark} params, kit with materials and states, clean SVG hero, valid rounds.json.

## bad-key
- FAIL key
Key `Night_Ferry!` is not lowercase kebab-case.

## key-clash
- FAIL key
Key `soft-form` equals a built-in key.

## unknown-move
- FAIL moves
A `moves` entry names `no-such-move`.

## bad-param-range
- FAIL moves
`corner-radius.base` is 999, range is 0..40.

## bad-pair
- FAIL moves
`base: {"light": 8}` (pair missing dark) and `controls: {"light": "x", "dark": 2}` (non-number side).

## unmapped-kit
- WARN kit-unmapped
Only `card` and `chip` mapped; the rest are listed. No FAIL.

## unknown-material
- FAIL kit
`kit.button-primary.material` is not a known material.

## kit-no-state
- FAIL kit
`kit.field` has a material but no state.

## missing-field
- FAIL fields
`coreTrick` is missing.

## bad-json
- FAIL json
aesthetic.json is truncated and does not parse.

## svg-script
- FAIL art
`art/hero.svg` has a `<script>` and an `onload` attribute.

## svg-warn
- WARN art
`art/hero.svg` has `<foreignObject>`, an external href and an `@import` style: all would be stripped. No FAIL.

## missing-art
- FAIL art
`art.hero.src` points at a file that does not exist.

## bad-rounds
- FAIL rounds
rounds.json: bad date, `by`, variant verdict, and a done note without a numeric `doneIn`.

## similar-high
- WARN similar
Moves chosen to map onto 11 of toy-press's 15 library moves (73%, threshold 70%). No FAIL.
