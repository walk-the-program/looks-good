# Product: Scent Box
Platform: mac
Purpose: A personal fragrance collection tracker: what I own, what I want and what I liked, with each scent's notes and accords in its own colour.
Core action: Add a fragrance.

## Screen: Collection
Job: See the whole shelf at a glance, filter it, and open any fragrance.
Primary action: Add fragrance
Chrome: toolbar
Fold: Title, tabs, search, the stats tiles and the first fragrance tiles fit in the 800 px window.
Signature: soft tiles on a quiet ground
Content:
1. title: Scent Box
2. segmented: | options: All 37; Owned 34; Interested 0; Liked 3 | selected: All 37
3. field: Search | placeholder: Search name, house or note
4. link: Filter · 18 houses
5. action: Add fragrance
6. stats: | items: Full bottles = 7; Travel and decants = 3; Samples = 24
7. stats: | items: Santa Maria Novella = Tabacco Toscano ★★★★☆; Santa Maria Novella = Vaniglia ★★★★★; Givenchy = Pi ★★★★☆; Scents of Wood = Praline in Maple 50 mL ★★★☆☆; Le Labo = Thé Noir 29 sample; d'Annam = Moonlight Samurai sample
States:
- Empty: No fragrances yet. One line and Add fragrance as the only action.
- Loading: none; the data is on the device.
- Error: none.
- First run: none.

## Screen: Fragrance detail
Job: Read everything about one fragrance: how it smells, its accords and notes, and my own rating and notes.
Primary action: Save
Chrome: toolbar
Fold: Hero, facts, accord tiles and notes fit above the fold.
Signature: soft tiles; scent colour is the only strong colour
Content:
1. card: Tabacco Toscano | meta: Santa Maria Novella · Full bottle · Owned | body: Dry tobacco leaf with warm spice over a soft leather base.
2. action: Save
3. stats: | items: Concentration = EDP; Year = 2003
4. stats: | items: tobacco = 100; warm spicy = 82; leather = 68
5. card: Notes | meta: Top: Bergamot · Lemon · Pink pepper | body: Heart: Tobacco leaf · Spices · Honey   ·   Base: Leather · Amber · Vanilla
6. card: ★★★★☆ | meta: My rating · Owned · Full bottle
7. card: My notes | body: Best in autumn. Two sprays is plenty; it lasts all day on a jacket.
States:
- Empty: Unrated fragrance shows five empty stars.
- Loading: none.
- Error: none.
- First run: none.

## Screen: Add fragrance
Job: Add a new fragrance in a few fields and save it to the shelf.
Primary action: Save fragrance
Chrome: toolbar
Fold: Every field and the action fit in the window.
Signature: soft filled fields on a quiet ground
Content:
1. title: Add fragrance
2. field: House | placeholder: Santa Maria Novella
3. field: Name | placeholder: Tabacco Toscano
4. segmented: | options: Owned; Interested; Liked | selected: Owned
5. segmented: | options: Full bottle; Travel; Decant; Sample | selected: Full bottle
6. field: Accords | placeholder: tobacco, warm spicy, leather
7. action: Save fragrance
States:
- Empty: All fields blank; Save fragrance is disabled until House and Name are filled.
- Loading: none.
- Error: House and Name are required; the missing field gets a plain line under it.
- First run: none.
