# Product: Scent Box
Platform: mac
Purpose: A personal fragrance collection: what I own, what I want and what I liked, with every scent drawn as its accords in their own colours.
Core action: Add a fragrance.

## Screen: Shelf
Job: See the whole shelf by smell, narrow it by status, accord or house, and open any fragrance.
Primary action: Add fragrance
Chrome: toolbar
Fold: The shelf count, the view switch, search and the first fragrances fit in the 800 px window, with Add fragrance in the bottom bar.
Signature: Every fragrance is its accord chord: a strip drawn in the scent's own colours, split by weight. The sheet draws the named fragrances' top accords as chords; the full 37-fragrance spectrum across the shelf is the mock.
Content:
1. hero-numeral: 37 | label: Fragrances on the shelf
2. text: 7 bottles · 3 small · 24 samples · 18 houses | muted: yes
3. segmented: Show | options: All 37; Owned 34; Interested 0; Liked 3 | selected: All 37
4. field: Search | placeholder: Search name, house, note or accord
5. action: Add fragrance | pin: bottom
6. chord: Santa Maria Novella · Tabacco Toscano | items: tobacco = 100 = #8d6e4c; amber = 85 = #d98e32; woody = 75 = #8b5a2b | labels: none
7. chord: Santa Maria Novella · Vaniglia | items: vanilla = 100 = #f2e3b3; sweet = 80 = #e8a0bf; woody = 55 = #8b5a2b | labels: none
8. chord: Santa Maria Novella · Muschio Oro | items: musky = 100 = #cfc6d9; floral = 85 = #f48fb1; white floral = 70 = #f7f3e8 | labels: none
9. chord: Ghost Stories · Harvest Moon · 9 | items: warm spicy = 100 = #c0392b; gourmand = 85 = #c98b5a; leather = 80 = #5d4037; tobacco = 75 = #8d6e4c; woody = 65 = #8b5a2b | labels: none
10. chord: Givenchy · Pi · 8.5 | items: aromatic = 100 = #5e9c76; vanilla = 85 = #f2e3b3; fresh spicy = 75 = #8bc34a; sweet = 65 = #e8a0bf; amber = 55 = #d98e32; woody = 45 = #8b5a2b | labels: none
11. text: Le Labo: Thé Noir 29, 7.5 · Santal 33 | muted: yes
12. text: d'Annam Memories of Japan sampler, 9 samples: Moonlight Samurai · Tokyo Nights · Sakura Snow | muted: yes
States:
- Empty: The shelf is empty. One line in the shop's own voice ("Nothing on the shelf yet. Add the first bottle, decant or sample.") and Add fragrance as the only action; the format bar shows a blank track.
- Loading: none; the data is on the device.
- Error: none.
- First run: none.

## Screen: Fragrance
Job: Read how one fragrance smells (its accord chord and its notes in time order), rate it and keep my own notes.
Primary action: Save
Chrome: toolbar
Fold: The name, the rating, the accord strip, the notes and the labelled accords fit above the fold, with Save in the bottom bar.
Signature: The accord chord as a vertical strip down the sidebar and as one labelled bar split by weight, and the notes as three bands in their real order, all in the scent's own colours.
Content:
1. card: Pi | meta: Givenchy · Full bottle · Owned · EDT 1998 | body: A fresh herbal opening of tarragon and mandarin gives way to anise and neroli, then settles into a warm vanilla, tonka and benzoin base.
2. hero-numeral: 8.5 | label: My rating, out of 10
3. chord: | items: aromatic = 100 = #5e9c76; vanilla = 85 = #f2e3b3; fresh spicy = 75 = #8bc34a; sweet = 65 = #e8a0bf; amber = 55 = #d98e32; woody = 45 = #8b5a2b; citrus = 40 = #f4d23c | labels: none | orient: vertical | column: side
4. text: Notes, in the order you smell them | column: inspector
5. chord: Top | items: Rosemary = 1 = #5e9c76; Basil = 1 = #5e9c76; Tarragon = 1 = #5e9c76; Mandarin Orange = 1 = #f4d23c | labels: below | column: inspector
6. chord: Heart | items: Geranium = 1 = #e05a7a; Lily-of-the-Valley = 1 = #f7f3e8; Anise = 1 = #c0392b; Neroli = 1 = #f4d23c | labels: below | column: inspector
7. chord: Base | items: Benzoin = 1 = #9c5b3a; Vanilla = 1 = #f2e3b3; Cedar = 1 = #8b5a2b; Tonka Bean = 1 = #e6d3a8 | labels: below | column: inspector
8. chord: Accords, by weight | items: aromatic = 100 = #5e9c76; vanilla = 85 = #f2e3b3; fresh spicy = 75 = #8bc34a; sweet = 65 = #e8a0bf; amber = 55 = #d98e32; woody = 45 = #8b5a2b; citrus = 40 = #f4d23c | labels: inside | column: inspector
9. text: Best in spring. Two sprays; the vanilla stays all evening. | column: inspector
10. action: Save | pin: bottom
States:
- Empty: Unrated shows no number, only the line "Rate it by feel, 0 to 10."
- Loading: none.
- Error: none.
- First run: none.

## Screen: Add fragrance
Job: Add a new fragrance in a few fields and put it on the shelf.
Primary action: Save fragrance
Chrome: toolbar
Fold: Every field and the action fit in the window.
Signature: The accord field turns what you type into the chord as you go; the sheet draws the chord for the example in the field, the live typing is the mock.
Content:
1. title: Add fragrance
2. field: House | placeholder: Santa Maria Novella
3. field: Name | placeholder: Tabacco Toscano
4. segmented: Status | options: Owned; Interested; Liked | selected: Owned
5. segmented: Format | options: Full bottle; Travel; Decant; Sample | selected: Full bottle
6. field: Accords | placeholder: tobacco:100, amber:85, woody:75
7. chord: The chord, as you type | items: tobacco = 100 = #8d6e4c; amber = 85 = #d98e32; woody = 75 = #8b5a2b | labels: inside
8. action: Save fragrance | pin: bottom
States:
- Empty: All fields blank; Save fragrance is disabled until House and Name are filled.
- Loading: none.
- Error: House and Name are required; the missing field gets a plain line under it.
- First run: none.
