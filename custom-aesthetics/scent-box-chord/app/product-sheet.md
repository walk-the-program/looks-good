# Product: Scent Box
Platform: mac
Purpose: A personal fragrance collection: what I own, what I want and what I liked, with every scent drawn as its accords in their own colours.
Core action: Add a fragrance.

## Screen: Shelf
Job: See the whole shelf by smell, narrow it by status, accord or house, and open any fragrance.
Primary action: Add fragrance
Chrome: toolbar
Fold: The shelf count, the view switch, search and the first fragrances fit in the 800 px window, with Add fragrance in the bottom bar.
Signature: Every fragrance is its accord chord: the spectrum strip across the shelf, drawn in the scents' own colours (mock only; the sheet shows each fragrance's top accords as words).
Content:
1. hero-numeral: 37 | label: Fragrances on the shelf
2. text: 7 bottles · 3 small · 24 samples · 18 houses | muted: yes
3. segmented: Show | options: All 37; Owned 34; Interested 0; Liked 3 | selected: All 37
4. field: Search | placeholder: Search name, house, note or accord
5. action: Add fragrance | pin: bottom
6. text: Santa Maria Novella: Tabacco Toscano (tobacco, amber, woody), Vaniglia (vanilla, sweet, woody), Muschio Oro (musky, floral, white floral)
7. text: Ghost Stories: Harvest Moon, 9 (warm spicy, gourmand, leather) · Le Labo: Thé Noir 29, 7.5 · Santal 33 · Givenchy: Pi
8. text: d'Annam Memories of Japan sampler, 9 samples: Moonlight Samurai · Tokyo Nights · Sakura Snow | muted: yes
States:
- Empty: The shelf is empty. One line in the shop's own voice ("Nothing on the shelf yet. Add the first bottle, decant or sample.") and Add fragrance as the only action; the format bar shows a blank track.
- Loading: none; the data is on the device.
- Error: none.
- First run: none.

## Screen: Fragrance
Job: Read how one fragrance smells (its accord chord and its notes in time order), rate it and keep my own notes.
Primary action: Save
Chrome: toolbar
Fold: The name, the rating, the accords and the notes fit above the fold, with Save in the bottom bar.
Signature: The accord chord as one bar split by weight, and the notes as three bands in their real order (mock only; the sheet shows both as words).
Content:
1. card: Pi | meta: Givenchy · Full bottle · Owned · EDT 1998 | body: A fresh herbal opening of tarragon and mandarin gives way to anise and neroli, then settles into a warm vanilla, tonka and benzoin base.
2. hero-numeral: 8.5 | label: My rating, out of 10
3. text: Accords, by weight: aromatic, vanilla, fresh spicy, sweet, amber, woody, citrus | muted: yes
4. text: Top: Rosemary · Basil · Tarragon · Mandarin Orange
5. text: Heart: Geranium · Lily-of-the-Valley · Anise · Neroli
6. text: Base: Benzoin · Vanilla · Cedar · Tonka Bean
7. text: Best in spring. Two sprays; the vanilla stays all evening.
8. action: Save | pin: bottom
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
Signature: The accord field turns what you type into the chord as you go (mock only; the sheet shows the field alone).
Content:
1. title: Add fragrance
2. field: House | placeholder: Santa Maria Novella
3. field: Name | placeholder: Tabacco Toscano
4. segmented: Status | options: Owned; Interested; Liked | selected: Owned
5. segmented: Format | options: Full bottle; Travel; Decant; Sample | selected: Full bottle
6. field: Accords | placeholder: tobacco:100, amber:85, woody:75
7. action: Save fragrance | pin: bottom
States:
- Empty: All fields blank; Save fragrance is disabled until House and Name are filled.
- Loading: none.
- Error: House and Name are required; the missing field gets a plain line under it.
- First run: none.
