/* Aesthetic principles: why each board works, and how that carries to a phone app.

   Read by js/ai-brief.js, which renders it into every App brief as the
   "Why this works (Guided)" section. Per aesthetic:
     principles  3-5 ranked, most important first. rule = the instruction,
                 board = what the board does, app = the phone-app translation.
     traps       board elements that must not reach an app as drawn, with the
                 substitute (or "leave it out").
   Values are ranges and relationships, not tokens: the brief lists the tokens.
   Plain strings only; backticked `--tokens` are allowed. App screens carry no
   board art, patterns or decorative bands: the signature comes through
   components. Limits: rule 12 words, board 35, app 40. */
(typeof window !== 'undefined' ? window : globalThis).AESTHETIC_PRINCIPLES = {

  'soft-form': {
    principles: [
      {
        rule: 'Give every control exactly one material.',
        board: 'Fields and tracks are recessed, buttons raised, the one action glossy, all in the canvas colour. Dense rows and body text stay flat.',
        app: 'Fields and list wells recessed, cards and secondary buttons raised, primary button the only glossy fill. Rows inside a card carry no shadow. Each control reads as pressed in, lifted or flat, never two.'
      },
      {
        rule: 'Spend the primary colour on one button per screen.',
        board: 'Colour appears only on the single glossy action and the switch knob. Progress, status and tags stay ink and canvas.',
        app: '`--primary` fills one button per screen plus the on-state switch knob. Selected segment, tab and progress use `--ink`. A screen with two glossy buttons fails.'
      },
      {
        rule: 'Make one big type step; keep everything else quiet.',
        board: 'A large, tight headline sits over small plain labels and a few large forms. Nothing competes with the headline.',
        app: 'Large title 34–40pt (hero numeral 64–84pt), at least 2x body size. Section labels 11–13pt. Body 15–17pt in `--ink`; `--muted` only for captions.'
      },
      {
        rule: 'Light every surface from the top left.',
        board: 'Shadow falls down-right and highlight up-left on every raised and recessed form. The light never moves.',
        app: 'Cards, buttons, fields and wells share one offset direction. A pressed button flips from raised to inset. Nothing shimmers or follows scroll. Dark mode strengthens the highlight; it never changes direction.'
      },
      {
        rule: 'Use few, large surfaces and leave flat space.',
        board: 'The board is a handful of big forms with open canvas around them, never a field of small bumps.',
        app: 'At most one raised card group and one recessed well per screen region. Dense lists sit flat inside one well or card. Section gaps 24–32pt; cut a section before shrinking a gap.'
      }
    ],
    traps: [
      {
        element: 'The hero art: recessed well, raised disc, primary semicircle.',
        instead: 'Leave it out. The relief on cards, fields and wells is the signature.'
      },
      {
        element: 'The iridescent glass panel as a content card.',
        instead: 'Use a raised card in the canvas colour. If glass appears at all, keep it to the tab bar or one sheet, with the coloured rim visible.'
      },
      {
        element: 'Neumorphic shadow on every list row.',
        instead: 'Flat rows split by a 1px `--line`, inside one recessed well or one raised card.'
      }
    ]
  },

  'dystopian-luxury': {
    principles: [
      {
        rule: 'Remove until each zone holds three things.',
        board: 'A tiny wordmark, vast white space and at most three visible elements per zone. Severity comes from what is missing.',
        app: 'Top bar, hero and each group show three things at most. Rows in a list are exempt but stay at least 56pt tall, 6 or more on list screens. Cut a section before shrinking space.'
      },
      {
        rule: 'Use one huge element; set everything else at caption size.',
        board: 'One gesture, the cropped brand word edge to edge. Every other line is a 15px caption or smaller.',
        app: 'One hero per screen: a large title or numeral 64–84pt, at least 4x body size, never cropped. Body 15–17pt, labels 11–13pt with 0.1em tracking. No in-between sizes.'
      },
      {
        rule: 'Make the single action an ink block.',
        board: 'The primary appears once per view, as a 6px square before the label of the one ink-black action.',
        app: 'Primary button is a square-cornered `--ink` rectangle, at least 48pt tall, with a 6pt `--primary` square before its label. One per screen. Secondary actions are underlined text links.'
      },
      {
        rule: 'Divide with 1px rules, never fills, shadows or radius.',
        board: 'Hairlines at 12% ink and hard cuts. No gradients, glows, soft shadows or rounded corners.',
        app: 'Rows, groups and fields are separated by 1px `--line`. Fields are underline-only. A selected cell or segment inverts to an `--ink` fill with canvas text. Cards have no fill, shadow or radius.'
      },
      {
        rule: 'Number items, never the product.',
        board: 'Accession numbers (2026.114.3) sit on one blank label as quiet catalogue detail.',
        app: 'Mono 11pt sequence numbers may prefix list-row subtitles. Never put them, or words like classified or restricted, beside the product name, wordmark or header.'
      }
    ],
    traps: [
      {
        element: 'The giant cropped brand word.',
        instead: 'Show the wordmark whole and small in the top bar. The hero is the screen\'s own numeral or question, uncropped.'
      },
      {
        element: 'The crop strip under the wordmark.',
        instead: 'Leave it out. Cropping type hides characters people need to read.'
      },
      {
        element: 'The blank label with four X stitches at its corners.',
        instead: 'A plain 1pt `--ink` box with a mono caption, or no box at all. No X corners.'
      },
      {
        element: 'Classified, restricted, division or archive references.',
        instead: 'Leave them out near the product name, wordmark and headers. Real status words only, such as Saved or Offline.'
      }
    ]
  },

  'mesh-gradient': {
    principles: [
      {
        rule: 'Keep surfaces white; put colour in a few actions.',
        board: 'Luminous colour sits in a band beside the work. Headlines sit on white in dark ink, and colour never goes behind text.',
        app: 'Gradient only on the primary button (135deg, two stops), progress bars, chart fills and the avatar. Canvas, cards and text stay opaque `--ink` on white. No gradient behind body text or cards.'
      },
      {
        rule: 'Make one oversized title or numeral the hero.',
        board: 'A huge bold headline with a thick accent swash under one word, over small tracked labels.',
        app: 'Large title 34–48pt or hero numeral 64–84pt in `--ink`, at least 2x the next size. Labels 11–12pt uppercase, tracked. One highlighted word per screen, none on a screen without a title.'
      },
      {
        rule: 'Layer opaque cards with soft neutral shadows.',
        board: 'White cards with a 1px hairline, radius 12 and layered navy-grey shadows. Nothing translucent.',
        app: 'Cards sit on the canvas with a 1px `--line` hairline and a two-layer neutral shadow. List rows inside a card get no shadow of their own. At most two card levels deep.'
      },
      {
        rule: 'Spend space before adding sections.',
        board: 'Wide gaps between sections, and no space is filled with pattern.',
        app: 'Section gaps 28–36pt, card padding 16–20pt. A Home screen with three blocks beats one with five. Cut a block before shrinking a gap.'
      }
    ],
    traps: [
      {
        element: 'The striated band behind headers and hero.',
        instead: 'Leave it out. A screen header is plain canvas with the title in `--ink`.'
      },
      {
        element: 'The thick swash under every headline.',
        instead: 'One highlighted word per screen at most, and none on screens without a title.'
      },
      {
        element: 'Numbered eyebrows like 01 / INTERFACE.',
        instead: 'Plain tracked labels with no numbers, especially on a screen with only three blocks.'
      },
      {
        element: 'The soft mesh glow behind the page title and the product card on the band edge.',
        instead: 'Leave both out. The title sits on flat canvas.'
      }
    ]
  },

  'liquid-glass': {
    principles: [
      {
        rule: 'Allow one glass moment per screen.',
        board: 'Glass floats as a few controls over a vivid scene. Every panel behind them is near-opaque.',
        app: 'Glass (blur plus bright rim) only on the tab bar, sheets and a floating action plate. Cards, lists, the top bar and fields stay opaque. Never nest glass inside glass.'
      },
      {
        rule: 'Float glass over content that scrolls beneath it.',
        board: 'Glass sits only over sharp content, such as hard colour edges, type and lists, so the rim has something to bend.',
        app: 'The tab bar and sheets overlap scrolling cards or rows with hard edges. On a flat, empty screen, use an opaque bar in `--canvas` instead of glass.'
      },
      {
        rule: 'Keep glass thin, with a bright rim.',
        board: 'Fill at 12% white or less, a specular rim top-left, a softer rim bottom-right and a dark outer hairline.',
        app: 'Tab bar is a capsule 56–64pt tall floating 8–12pt above the home indicator, with a visible 1pt rim. Labels 10pt at 4.5:1 or better on its fill. Sheets use the same fill and rim.'
      },
      {
        rule: 'Make one hero big and the rest quiet.',
        board: 'A large headline and a tiny tracked label carry the page. Panels around them are plain.',
        app: 'Hero numeral 64–84pt or large title 34–40pt, at least 2x the next size. Labels 11–12pt. Body 15–17pt. Primary tints one action per screen.'
      },
      {
        rule: 'Give glass an opaque fallback.',
        board: 'A reduced-transparency version keeps the rim and drops the blur.',
        app: 'With Reduce Transparency on, the tab bar and sheets turn solid, keeping the 1pt rim and the same height. Text contrast stays at 4.5:1 or better.'
      }
    ],
    traps: [
      {
        element: 'The dark scene of coloured lights behind the glass.',
        instead: 'Leave it out. The app canvas stays flat `--canvas`; the content scrolling under the bar is what the glass bends.'
      },
      {
        element: 'The refracting lens and optics strip.',
        instead: 'Leave them out. Glass in the app is the tab bar and sheets only.'
      },
      {
        element: 'The product view with glass sidebar, header, cards and nav rows.',
        instead: 'Opaque cards and top bar. Glass stays on the tab bar and sheets; stacked glass reads as noise.'
      }
    ]
  },

  'gorpcore': {
    principles: [
      {
        rule: 'Write every number with its unit, in mono.',
        board: 'Specs read like a hang-tag table: 312 g, 20D, 2,061 m. Every figure carries its unit.',
        app: 'Rows and stats show label left in sans, value plus unit right in mono (`12 min`, `3.2 km`). Hero numeral 64–84pt keeps its unit at 20–24pt beside it. No bare numbers.'
      },
      {
        rule: 'Spend the shell colour on one big panel.',
        board: 'The shell fabric colour covers about 10% of the board: the main action, the woven label and one trail.',
        app: '`--primary` fills the main action, the title label and the on-state switch. No second large primary panel on a screen. Everything else is stone canvas and carbon `--ink`.'
      },
      {
        rule: 'Mark the selected tab with one blaze dot.',
        board: 'Blaze orange appears once per view: a single zip pull and a single position dot.',
        app: 'The selected tab gets a 6–8pt blaze-orange dot under its icon. That is the only orange on the screen. Unselected tabs are `--muted` with no dot.'
      },
      {
        rule: 'Set the title as a woven label.',
        board: 'The headline\'s last word sits on shell-coloured fabric with a dashed stitch line inset all round.',
        app: 'The last word of the large title, on one line, sits on a `--primary` label with a dashed stitch line inset about 0.08em. One label per screen; text on it at 4.5:1 or better.'
      },
      {
        rule: 'Keep cards flat, like paper hang tags.',
        board: 'Spec tables sit on paper tags with hairline rules, tidy columns and no shadows.',
        app: 'Cards are paper fill with a 1px hairline, no shadow, radius 8pt or less, 20pt padding. Section labels are 11–13pt tracked caps; row dividers are 1px `--line`.'
      }
    ],
    traps: [
      {
        element: 'Contour-map artwork and the ripstop grid on the canvas.',
        instead: 'Leave them out. The canvas is flat stone or carbon.'
      },
      {
        element: 'Hang-tag straps, webbing and punched holes.',
        instead: 'Leave them out. A plain paper card with a hairline is the tag.'
      },
      {
        element: 'Trail-blaze circle, square and diamond marks as decoration.',
        instead: 'Use them only on rows that really carry a difficulty level. Never as ornament.'
      }
    ]
  },

  'blob-tracking': {
    principles: [
      {
        rule: 'Frame content in hairline boxes, not filled planes.',
        board: 'Panels are 1px boxes on a near-black frame. Boxes are square, and nothing is filled lighter than the frame.',
        app: 'Cards and groups are 1px `--line` boxes with square corners on `--canvas`: no fill, no shadow, no rounding. Padding 16–20pt. Lists inside a box divide with 1px rules.'
      },
      {
        rule: 'Lock exactly one target per screen.',
        board: 'One locked target carries the primary: its box, tab and tint. Everything else is white-ink hairline.',
        app: 'One element per screen (the selected item, current question or main action) gets a `--primary` box and filled tab. All other elements stay `--ink` and `--line`. Two locked boxes fail.'
      },
      {
        rule: 'Label each box with a solid mono tab.',
        board: 'Every box carries a solid mono tab with its class and confidence, such as PERSON 0.93.',
        app: 'Section cards carry one solid tab on the top-left edge: 10–11pt mono caps, 24pt tall, naming the section plus a real count. Rows do not repeat tabs. Tab text at 4.5:1 or better.'
      },
      {
        rule: 'Read out numbers large and plain.',
        board: 'Tabs and captions are tiny; the readouts and headline are the only large things.',
        app: 'Hero numeral 64–84pt in mono or tabular figures, at least 2x the next size. Captions and tabs 10–12pt. The locked target\'s readout never overlaps another label.'
      },
      {
        rule: 'Space boxes apart even though the board crowds them.',
        board: 'Detection boxes overlap and nest densely to look like tracking.',
        app: 'Never overlap or nest boxes. Keep at least 12pt between boxes and 44pt tap targets. Text never truncates; it wraps to another line.'
      }
    ],
    traps: [
      {
        element: 'The dithered footage plate and the duotone wash.',
        instead: 'Leave them out. The frame is flat `--canvas`.'
      },
      {
        element: 'Overlapping, nested and uneven detection boxes.',
        instead: 'Evenly spaced, non-overlapping hairline cards. Overlap would cramp controls and clip text.'
      },
      {
        element: 'Centroid links and corner ticks on every box.',
        instead: 'Leave them out. The tab and the single locked box are the whole signature.'
      },
      {
        element: 'The "TEXT 0.99 · CLASS: HEADLINE" tag around the headline.',
        instead: 'A plain large title with its last word in `--accent`, no box.'
      }
    ]
  },

  'pirate-broadcast': {
    principles: [
      {
        rule: 'Run a teletext Title row across the top.',
        board: 'Row 0 of every screen carries the page number, service name and clock on a solid cyan strip.',
        app: 'Top bar is a solid cyan strip, 44pt, with black mono caps (page number plus screen name, such as `P101 HOME`). One per screen. Cards and sections get no title rows of their own.'
      },
      {
        rule: 'Make the tab bar a row of Fastext keys.',
        board: 'Four coloured Fastext keys sit on row 24 at the bottom of the screen.',
        app: 'Tab bar is 4 equal full-width keys, 49–56pt tall, in fixed teletext red, green, yellow and cyan with black 11pt+ labels. The selected key is shown inverted. Never client colours.'
      },
      {
        rule: 'Reserve the client colour for the station ident.',
        board: 'The client colour appears only on the brand mark, one page number and the inverse block behind a headline word.',
        app: '`--primary` appears once per screen: the main action or the highlighted title word as an inverse block (black glyphs on `--primary`). Bars and keys stay teletext colours.'
      },
      {
        rule: 'Set rows on a grid with dotted leaders.',
        board: 'The page is a 40-column character grid, so label and value sit on one line.',
        app: 'List and settings rows show label, dotted leader, then value on one line in mono, 44pt minimum height. Values right-align and never truncate; a long label wraps to a second line.'
      },
      {
        rule: 'Use one blocky title per screen.',
        board: 'Headlines are double-height teletext characters, and the last word is an inverse-video block.',
        app: 'Large title 34–44pt in a mono or pixel face, caps, on one line or wrapped without cuts. Its last word takes the inverse block. Real text stays selectable. Body 15–17pt.'
      }
    ],
    traps: [
      {
        element: 'The test card picture and the torn rogue-signal frame grab.',
        instead: 'Leave them out. App screens carry no pictures from the board.'
      },
      {
        element: 'Scanlines, CRT glow and the rounded TV bezel.',
        instead: 'Leave them out. Screens are flat black with sharp-cornered keys and rows.'
      },
      {
        element: 'A numbered title row (P101, P102, P103) on every card.',
        instead: 'One Title row in the top bar only. Cards use a plain label.'
      },
      {
        element: 'Test bars and the full eight-colour palette as decoration.',
        instead: 'Use teletext colours only for status and the Fastext keys, one meaning each.'
      }
    ]
  },

  'xerox-punk': {
    principles: [
      {
        rule: 'Put content on paper scraps over a dark wall.',
        board: 'Newsprint and white scraps with black type are pasted over a near-black wall. Sheets overlap and collide.',
        app: 'Cards are newsprint or white scraps with black type and a 2px `#111` border on the dark `--canvas`, spaced 16–24pt apart. Tilt only a badge or one card, by 2 degrees at most.'
      },
      {
        rule: 'Cast hard offset shadows with no blur.',
        board: 'Scraps, tiles and buttons carry a solid black offset shadow and a 2px edge.',
        app: 'Cards, buttons and sheets get a 3–4pt solid black offset shadow, no blur. A pressed button moves 3pt down-right and its shadow collapses to 1pt.'
      },
      {
        rule: 'Use the fluoro once per screen.',
        board: 'One Day-Glo ink covers about a tenth of the board: the action tile, one in five headline tiles, the highlighter swipe.',
        app: '`--primary` fills the main action tile and the on switch, and sits behind one highlighted word. Nothing else is fluoro. Never as text on newsprint.'
      },
      {
        rule: 'Stamp the status; type everything else.',
        board: 'Statuses are rubber stamps and running text stays crisp and typewritten. Grain goes on images only.',
        app: 'Status badges are bone-coloured stamps: caps, 2px border, up to 2 degrees tilt. Body, labels and fields stay uniform at 15–17pt, never cut-and-pasted letter by letter.'
      },
      {
        rule: 'Cut up only the title.',
        board: 'Ransom-note headlines give every letter its own face, size and tilt, and the last word is circled in marker.',
        app: 'One large title per screen may use 3–5 mixed-face tiles at 72–145% size and up to 6 degrees tilt. It must read at a glance and wrap without truncation. All other text is uniform.'
      }
    ],
    traps: [
      {
        element: 'Torn paper edges, tape strips and pins.',
        instead: 'Leave them out. Scraps are plain hard-edged rectangles with an offset shadow.'
      },
      {
        element: 'Ransom-cut letters on every heading, label and button.',
        instead: 'Cut-up type on the large title only. Everything else is uniform and legible.'
      },
      {
        element: 'Black censor bars over text.',
        instead: 'Leave them out. They hide content, and read like classified marks.'
      },
      {
        element: 'Random tilt on every element and photocopy grain over the UI.',
        instead: 'Straight, aligned controls with 44pt tap targets. Grain stays on images, never on text or fields.'
      }
    ]
  }
};
