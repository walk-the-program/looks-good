# Making Branding Designer impressive to show

Session date: 2026-10-14. Question from the owner: "Come up with features that may help if this product were to be released commercially." Clarified: the goal is not sales. The goal is to be able to present the product to consumers and other people and impress them, both when they first see it and when they first use it.

The session follows Frame, Diverge, Provoke, Converge, Capture. It is opinionated on purpose. Each bet ends with the assumption that could sink it and a test that needs no code.

---

## 1. Frame

### What we are deciding

We are deciding what makes someone who has never seen this product say "wait, show me that again" in the first minute, and what keeps that reaction intact for the next ten. Pricing, licensing and monetisation are out of scope.

Today's app is tuned for one expert user. He knows all 35 aesthetics by name, reads 250-line Markdown briefs, and knows that "Classic/Current" refers to round 6. A first-time viewer has none of that context, and the product has to work without it.

### What is impressive about it, underneath

The product turns a taste decision into a finished visual world in seconds: one brand rendered as a product UI, a 10-slide deck and a pattern system in 35 different design languages. It also turns that taste into an exact contract an AI agent can build from. Two things in that are worth showing off:

1. **Range with coherence.** Your brand, in 35 completely different worlds, each one internally consistent. Most tools show you a palette. This one shows you a place.
2. **The payoff.** The design language becomes a real-looking app. That payoff is currently hidden behind a wall of Markdown. The brief is the most valuable thing the product makes and the least impressive thing to look at.

### The three ways people will meet it

- **Live demo, owner presenting.** A laptop, two to five minutes, often in a room with unreliable Wi-Fi. The owner controls the pace, and any stall or rough edge is visible to everyone.
- **Hands-on first run.** Someone downloads it or opens the web version and pokes at it alone. They will never read a README. If nothing good happens in 60 seconds, they close it.
- **Second-hand.** A link, a video clip or a screenshot that travels without the owner. Most people will see the product this way, if at all.

A feature that impresses in only one of these three contexts is worth less than one that works in all three.

### What the viewer wants (jobs)

- The viewer watching a demo: "When someone shows me a new tool, I want to understand what it does in ten seconds and see something I couldn't easily do myself, so I know whether it's worth my attention."
- The first-time user: "When I open this, I want to make something that looks like *mine* almost immediately, so I feel clever rather than lost."
- The owner: "When I show this, I want it to run itself without breaking, so the conversation is about the work and not about the bugs."

There is an emotional job here too, and it is the strongest of the four. The viewer wants to feel that their brand, company or side project could look this good.

### The bar people already carry

Audiences have seen v0 and Lovable demos: type a sentence and get an app in 30 seconds. They have seen Figma's polish and Looka putting a logo on a business card, a T-shirt and a storefront. Realtime Colors and tweakcn have shown them a palette dropped into a sample site. So "here is a palette on a sample page" is no longer impressive. A complete, coherent world built around *their* brand, ending in a real-looking product, still is.

### Constraints and known rough edges (grounded in the code)

- The owner won't pay for model APIs. Any "AI moment" has to use his own Claude subscription (pre-recorded or run live) or deterministic code.
- The Mac app is unsigned. A first-time user gets a Gatekeeper warning before seeing anything, which is the worst possible first impression. The app is also Apple Silicon only.
- Fonts, html2canvas and jsPDF load from CDNs on first run (README). A demo on bad Wi-Fi shows fallback fonts, and the whole product is about type.
- The README admits that PNG and PDF exports of aesthetics that use `backdrop-filter`, conic gradients or blend modes "export flatter than it looks on screen". A shared export can look worse than the live app.
- The brief's pattern source points at `~/Desktop/Branding Designer` (`PATTERN_SOURCE_ROOT` in `js/ai-brief.js`), so a shared brief references a folder nobody else has.
- The Classic/Current toggle, and terms like "donor", "channels" and "brief cart", are internal vocabulary.
- Round 6's harsh review scored aesthetics 3 to 6 out of 10, and QC logged 15 blocker and 174 major defects (now fixed). Quality varies across the 35 aesthetics, and a demo is only as strong as the weakest aesthetic someone happens to click.

### What a great outcome looks like

A short list of bets that make the first 60 seconds memorable, make the brief-to-app loop visible, and remove everything that would embarrass a demo. Each bet is testable within two weeks without new code.

### Reframing as questions (How might we)

- How might we make a stranger see *their own* brand in the first 30 seconds?
- How might we make the brief's payoff visible without making anyone read Markdown or wait for an agent?
- How might we let a demo travel without the owner in the room?
- How might we make switching aesthetics feel like a transformation, not a page reload?
- How might we make sure nothing a viewer clicks can embarrass the product?

---

## 2. Diverge

No filtering in this section. Ideas are grouped by area and numbered for reference.

### Wow in the first 60 seconds

1. **Brand reveal.** Type a name, and the board assembles itself on screen: the palette drops in, the headline sets letter by letter in the brand font, the art draws, and the UI components settle into place. The first thing anyone sees should be motion and arrival, not a sidebar.
2. **Drop your logo.** Drag in a logo. The app extracts its colours locally, assigns them to roles, picks a matching font pair and reveals the brand. "Give me your logo" is the most powerful line a demo can have, because everyone in the room has one.
3. **Start from your website.** Paste a URL. The Mac app loads it in a hidden WKWebView, reads its real colours and fonts, and shows "this is you today" next to "this is you in 35 worlds."
4. **The 35-worlds zoom.** After the reveal, zoom out from one board to the Compare-all wall of every aesthetic in the same brand, then zoom back into whichever one the viewer points at. This view already exists. It just isn't staged.
5. **Morphing transitions.** Switching aesthetics cross-fades and morphs (the View Transitions API, supported in current WebKit) instead of snapping. Colour flows, type reflows and the art dissolves into the new art. This one change turns "a theme picker" into "a transformation."
6. **Slot-machine shuffle.** Hold Space to spin through aesthetics like a reel and release to land on one. It is fun to watch and fun to do.
7. **Blend as a slider.** Drag a slider from one aesthetic to another and watch the art, type, colour and material channels come over one at a time. The blend engine is one of the product's most unusual features, and today it hides behind chips labelled with internal channel names.

### First run and onboarding

8. **Three-question start.** "What are you making? Who's it for? Quiet or loud?" The answers narrow 35 aesthetics to three boards side by side. Pick one and you're in.
9. **Showcase brands.** Ship eight to ten fictional brands that look great (a coffee roaster, a fintech app, a synth maker, a climbing gym), so the library opens full and a demo never shows "Acme|Co" or "Brand Name."
10. **Progressive disclosure.** Locks, typography sliders, pattern parameters and the brief cart start collapsed under "Refine." A new user sees name, logo, colours, aesthetic and a big "See it built" button.
11. **Coach marks**, three at most, pointing at shuffle, blend and "See it built," then never shown again.
12. **An empty state that teaches.** A blank library shows one animated example brand cycling through aesthetics, with one button: "Make yours."

### Making the brief-to-app loop visibly magical

13. **"See it built."** One click renders the brand into a realistic, clickable multi-screen product: a dashboard, settings, a mobile onboarding flow and a landing page, built from the same tokens and rules the brief gives an agent. It is deterministic templates, not AI, but it shows the payoff in one second instead of five minutes.
14. **Product-type switcher.** SaaS dashboard, mobile app, e-commerce, portfolio or landing page, so viewers see *their kind* of thing.
15. **Before and after slider.** A generic AI-built app (shadcn defaults, Inter, purple button) on the left and the same app in the brand on the right, with a drag handle between them. This is the single clearest explanation of why the product exists.
16. **Proof gallery.** For each aesthetic, real screens Claude Code built from its brief, recorded by the owner. They prove the brief works on a real agent.
17. **Live agent run, with a safety net.** In the demo, copy the brief, start Claude Code in a terminal next to the app, and watch localhost fill in on the brand. Keep a recorded replay one keystroke away, because live runs are slow and unpredictable.
18. **"What the agent sees" view.** Render the brief as a beautiful document (swatches, type specimens, do and don't cards, pattern tiles) with "Copy for Claude / Cursor / v0" buttons. Never show raw Markdown as the punchline.
19. **Brand check overlay.** Point the Mac app at the agent-built localhost page. It walks the DOM and pins small markers on anything off-brand ("not a brand colour," "wrong font," "contrast 2.8:1"), then turns them green as the agent fixes them. The loop becomes visible.
20. **"Claude just read your brand."** If a local MCP server or CLI pulls the brand into a repo, the app shows a small live toast. It makes the connection between app and agent tangible in a demo.

### Showcase and presentation

21. **Present mode for the deck.** Full screen, arrow keys, slide transitions in the aesthetic's own style, presenter notes and a clicker-friendly layout. The 10-slide deck is already good, so let it be presented, not just exported.
22. **Demo mode (attract loop).** A self-running sequence: brand reveal, 35-worlds zoom, blend slider, "See it built," the deck, and back to the start. Press any key to take over. It works on a booth screen, a desk at a meetup, or a laptop left open at a coffee table.
23. **Presenter view for the app.** One shortcut hides the sidebar and chrome, enlarges the board and maps numbered keys to the demo beats (1 reveal, 2 worlds, 3 blend, 4 built, 5 deck).
24. **Exported mini-site.** One self-contained HTML file (or folder) per brand: board, deck in present mode, the app mock, the pattern wall and the brief, with no install and no server. It is the shareable version of the demo, and the app already exports a standalone brand guide as HTML, so the pattern is proven.
25. **Reel export.** A 15-second vertical and horizontal video of the brand reveal and a sweep through six aesthetics, ready for social media. In the Mac app, WKWebView snapshots can feed AVFoundation, which avoids slow html2canvas frames. Most people will meet the product through a clip like this.
26. **Mockup scenes.** The brand on a business card, an app icon on a phone home screen, a tote bag, a shopfront sign or a laptop sticker. Looka shows that mockups make a brand feel real to non-designers.
27. **Wallpaper souvenir.** Export the brand's pattern as a desktop or phone wallpaper. The viewer leaves the demo with their brand on their phone.
28. **Comparison print.** One poster-sized image of a brand across all launch aesthetics, which makes a strong social post and a good thing to print for a wall.

### Polish and delight

29. **One motion system.** Shared easing and timing tokens for every transition, plus a `prefers-reduced-motion` path that replaces motion with cross-fades.
30. **Native-quality exports in the Mac app.** Use WKWebView's own `takeSnapshot` and `createPDF` instead of html2canvas, so exports look exactly like the screen, including glass, gradients and blend modes.
31. **Mac-native feel.** A real app icon, launch speed under a second, window state restored, proper menus and shortcuts, a vibrancy sidebar, and an About box with credits.
32. **Sound.** A soft click on shuffle and a chime on reveal, and possibly per-aesthetic sounds (a photocopier thunk for xerox, a dial-up chirp for old-web). Off by default.
33. **Designed loading and empty states.** No blank flashes when Compare all builds 35 boards, and skeleton tiles that match the brand.
34. **Easter eggs.** The Konami code turns on old-web; shaking the window shuffles.

### Credibility and trust

35. **Signed, notarized and universal.** No Gatekeeper warning, and it runs on Intel Macs too.
36. **Works offline.** Bundle every font and library, so the demo looks right on conference Wi-Fi.
37. **Visible accessibility.** A small "AA contrast" badge on each board, with keyboard navigation, VoiceOver labels and a colour-blindness preview. Designers notice when a tool respects accessibility.
38. **A name and a landing page.** "Branding Designer" describes the product but doesn't sound like one. A short name, a one-page site and a 60-second video make it feel like a real product rather than a side project.
39. **Credits.** Name the fonts (Open Font License) and libraries in About. It signals care.

### Remove or simplify (things that would embarrass a demo)

40. **Remove the Classic/Current toggle** from what anyone else sees. It records the owner's review history, and to a viewer it only raises the question of which version is the right one.
41. **Show 20 aesthetics, not 35.** The owner's own list of 20 favourites from the r7-trim review is the showcase set. Keep the rest in a hidden "Lab" for himself. A demo is only as good as the weakest aesthetic a viewer clicks.
42. **Replace internal vocabulary.** "Blend with … donor … channels" becomes "Mix in … borrow its art / type / colour / texture / finish." "Brief cart" becomes "Add to brief." No round numbers or file names anywhere in the UI.
43. **Never show placeholder copy.** No "Brand Name" or "A short tagline that captures the brand." Generate a believable tagline, or use the showcase brands.
44. **Hide the live heuristic feedback panel** unless it says something a viewer would care about. Warnings in a demo read as "the tool is complaining."
45. **Remove the Desktop path from shared briefs**, and replace it with exported pattern files.
46. **Kill export paths that look worse than the screen** until idea 30 fixes them, or label them honestly.

### Do the opposite

47. **Show less, not more.** The instinct is to demo everything: 35 aesthetics, 53 pattern families, blend, the deck, exports. The opposite is a three-minute demo with one brand, three aesthetic switches, one blend and one "See it built" moment. Restraint reads as confidence.
48. **The viewer does nothing.** Instead of handing someone the controls, the app brands *them*: it takes their name or logo and builds and presents their brand in a self-running sequence, like a photo booth. The opposite of a tool demo is a gift.
49. **The app disappears.** Make the exported mini-site the demo. The product's best surface is its output, not its editor.

---

## 3. Provoke

### The strongest argument against optimising for impressiveness

Demo-ware is a real trap. Reveals, morphs and attract loops make a product look better for three minutes and slower every day after that. The owner's actual use is directing AI agents to build product UIs, and none of the wow features make an agent build better. Worse, a dazzling board can set up a letdown: if the viewer then tries it and their agent builds something plain, the gap between promise and result becomes the story. The most impressive moment has to be *true*, meaning the real agent output, or the polish works against the product.

There is a second risk. Thirty-five styles in a grid can read as "a theme picker," something people have seen before. Breadth looks like quantity unless curation shows taste.

The answer shapes the bets below. Every motion feature must be skippable and must not slow real use. Every "built" mock must match what an agent actually produces from the brief. Curation comes before breadth.

### Who would be unimpressed, and why

- **Brand designers** will see presets dressed up as branding, with no strategy behind them, and will go looking for the weakest aesthetic and the worst kerning. To win them over, lead with craft (the type specimen, the deck, the materials), show the curated set, and never call it "branding in one click."
- **Developers** don't care about boards. They want to see the code and the built app. Lead with the before and after slider and the proof gallery.
- **Non-technical people** won't understand "AI brief" at all. Lead with their logo becoming 20 worlds, and mockups on a phone and a business card.
- **Anyone who has seen v0 or Lovable** will compare speed. If "See it built" takes more than a second, or depends on watching an agent type for four minutes, the moment is lost.

### How others demo, and what to take from them

- **v0 and Lovable**: a sentence becomes an app in 30 seconds. Lesson: end the demo on a real-looking product, fast.
- **Figma**: polish, multiplayer cursors, everything instant. Lesson: no stalls, no visible seams.
- **Relume**: one continuous flow from sitemap to wireframe to style guide. Lesson: a single uninterrupted story beats a feature tour.
- **Looka**: your logo on merchandise. Lesson: people believe in a brand when they see it on real objects.

The common thread is one flow, ending in something real, with no waiting. The current app is a feature-rich workspace without that story.

### What we are not seeing

We don't yet know which moment makes people react. The owner thinks of the blend engine and the patterns as the product's best features because they took the most work. Viewers may react most to something cheap, like their logo appearing on a phone. Watching five people is better than guessing.

---

## 4. Converge

### Themes

The 49 ideas fall into five themes: personal first impression (1 to 7, 9, 48), the visible payoff (13 to 20), the show itself (21 to 24, 47), things that travel (24 to 28, 49), and trust and polish (29 to 46). Ranked on how strongly each impresses, whether it works across all three contexts (live, hands-on, second-hand), whether it stays honest to what agents actually build, and feasibility for a solo builder:

### The five bets

**Bet 1. "See it built": the brand applied to a realistic product, with a before and after (ideas 13, 14, 15, 16, 18).**
This is the bet. It makes the brief's payoff visible in one second, without Markdown and without waiting for an agent. The before and after slider explains why the product exists better than any sentence can. The proof gallery of real agent builds keeps it honest. It works live, hands-on and in screenshots.
- Riskiest assumption: what an agent actually builds from the brief looks close to the mock. If real agent output is noticeably plainer, the mock becomes a promise the product can't keep.
- Cheapest test: by hand, build a before and after for two brands: a generic agent-built dashboard with no brief, and the same prompt in Claude Code with the brief. Put the agent-built "after" next to the board's own example UI. Show five people the before and after, and ask what they think the product does. Separately, judge honestly whether the agent's after is close enough to the board to put in a mock.

**Bet 2. Personal brand reveal: drop your logo or name, and watch your brand arrive and fan out into 20 worlds (ideas 1, 2, 4, 5, 9).**
Personalisation is the strongest emotional hook there is. Seeing your own logo in 20 coherent design languages is a moment nobody forgets, and it carries the demo even for people who don't build software. Morphing transitions turn switching from a reload into a transformation.
- Riskiest assumption: arbitrary real logos give good brands. Many logos are one colour, or have colours that clash or fail contrast, and a bad first result in front of the person whose logo it is would be worse than no demo.
- Cheapest test: collect ten real logos from friends or local businesses. In the current app, eyedrop their colours into a brand by hand and look at Compare all. Count how many produce boards you would happily show the logo's owner. Under seven out of ten means the extraction step needs taste rules (for example, adding a neutral and a complementary accent) before this is demo-safe.

**Bet 3. A scripted show: presenter view, deck present mode, and a self-running demo loop (ideas 21, 22, 23, 47).**
Live demos are where the owner has the most control and the most to lose. One keyboard-driven flow (reveal, 20 worlds, mix in, see it built, deck) removes fumbling and makes "show less" the default. The same sequence, set to run unattended, becomes the booth loop and the raw material for the reel.
- Riskiest assumption: live demos are how most people will meet the product. If most impressions are second-hand, investing in presenter tooling pays less than investing in shareable output.
- Cheapest test: write a three-minute script and give the demo live to five people using the current app. Time each beat, note where attention drops and where people react, and write down every question they ask. In the same week, count how many people are actually reachable live versus by a link or a clip.

**Bet 4. Output that travels: the exported mini-site, a 15-second reel and mockup scenes (ideas 24, 25, 26, 27).**
Most people will see the product without the owner in the room. A link that opens a polished brand mini-site, a clip that loops the reveal, and a brand shown on a phone and a business card all carry the wow on their own. They are also what people forward to others.
- Riskiest assumption: static output impresses without interactivity. People may glance at a link and bounce, or a reel may read as "another AI tool ad."
- Cheapest test: record one 15-second reel by hand with QuickTime (reveal, then a sweep through six aesthetics), and save one static grid image of the same brand. Send each to ten different people, or post them, and compare replies, questions and "what is this?" messages.

**Bet 5. A trust and cut pass: signed, offline, native exports, and nothing embarrassing (ideas 30, 31, 35, 36, 40 to 46).**
One rough edge undoes a wow: a Gatekeeper warning before the first screen, fallback fonts on venue Wi-Fi, an export that looks flatter than the screen, a "Classic/Current" toggle, a weak aesthetic, the word "donor," or "Brand Name" on a slide. This bet is unglamorous, and the other four depend on it.
- Riskiest assumption: the owner can see his own rough edges. After seven rounds he can't, because nobody can see their own product fresh.
- Cheapest test: a hallway test. Three people who have never seen the product install it and use it for five minutes, unaided and screen-recorded, with Wi-Fi switched off for one of them. Write down every hesitation, every "what does this mean?" and every visual glitch. That list becomes the cut list.

### What I would kill or park

- **Sound (32). Park; off by default at most.** Sound in a demo room is a gamble, and in a shared office it's an annoyance. It may earn a place in the reel's soundtrack, but not in the app.
- **Easter eggs (34). Park.** They are charming once the basics are flawless, and a distraction before then.
- **Live agent run as the main demo moment (17). Demote.** Watching an agent type for four minutes kills momentum, and a live failure is memorable for the wrong reasons. Use it as an optional encore, with the recorded replay as the default.
- **Brand check overlay (19). Park until after 90 days.** It is the most magical version of the loop, but it is real engineering, and the before and after slider tells most of the same story far more cheaply.
- **The full 35 aesthetics and all 53 pattern families in the showcase. Cut from view.** Keep them in a Lab. Breadth is for the owner, and curation is for the audience.
- **A public gallery or hosted accounts. Kill.** They add servers and moderation for no gain in impressiveness that the mini-site can't already give.

### The riskiest assumption overall

The agent-built result is as impressive as the board promises, in other people's hands with other people's prompts. Everything else (reveals, morphs, reels) amplifies a promise. If the real payoff is plain, a more dazzling front end only makes the letdown bigger.

### The first test to run: a brief bake-off

1. Pick three showcase aesthetics that are clearly different (bento-grid, soft-form, xerox-punk) and one showcase brand.
2. Write one ordinary prompt: "Build a habit-tracker dashboard with a sidebar, today's habits, a streak chart and a settings page."
3. Run it in Claude Code with the owner's own subscription (no API cost): once with no brief, and once with each aesthetic's brief. That gives four screenshots. If there's time, repeat in v0 or Lovable on their free tiers.
4. Show five people the unbranded and branded results unlabelled, along with the three boards. Ask "Which one would you be proud to ship?" and "Which board does each screen belong to?"
5. Pass mark: at least four of the five pick the branded version every time, and most screens are matched to the right board.

The test also produces the first before and after slider, the first proof gallery entries and the first reel footage, so nothing is wasted. If it fails, fix the brief first: make it shorter, more prescriptive, and give it component code. Do that before building any front-end wow.

---

## 5. Capture

### 30, 60 and 90 days

**Days 1 to 30: find out what works, and remove what would embarrass the product.**
- Run the brief bake-off (bet 1 and the overall test).
- Run the logo test with ten real logos (bet 2).
- Give five scripted live demos (bet 3), and send the hand-made reel and the static grid (bet 4).
- Run the hallway test, with one person offline (bet 5).
- Do the cut pass:
  - A showcase build with no Classic/Current toggle, the 20-aesthetic set and the rest in a Lab.
  - Plain-language labels ("Mix in," "Add to brief").
  - Eight showcase brands and no placeholder copy.
  - The heuristic panel and fine-tuning sliders collapsed.
- Enrol in the Apple Developer Program, then sign and notarize one build. Bundle fonts and libraries for offline use.
- Decision gate on day 30: if the bake-off fails, spend days 31 to 60 on the brief, not on the front end.

**Days 31 to 60: build the core wow.**
- "See it built": dashboard, landing page and mobile screens rendered from the brand's tokens, with a product-type switcher and the before and after slider. Seed the proof gallery from the bake-off.
- The brand reveal and one motion system, with morphing transitions between aesthetics and a reduced-motion path.
- Drop-a-logo start, with the taste rules learned from the logo test.
- Native-quality exports through WKWebView `takeSnapshot` and `createPDF`, which also fixes the flat exports.
- "What the agent sees": the brief rendered as a designed document with copy buttons, and the Desktop path removed.

**Days 61 to 90: package the show and let it travel.**
- Presenter view with numbered demo beats, deck present mode, and the self-running demo loop.
- Mini-site export (one HTML file), reel export, and three mockup scenes: phone, business card and app icon.
- A name decision, a one-page site and a 60-second launch video cut from the reel export.
- A showcase moment: demo to 20 people (a meetup, a design community call, friends who build things) and post the reel.
- Measure what was observed, not page views:
  - Time to the first spoken reaction.
  - The share of viewers who ask to try it themselves.
  - The share who send it to someone else.
  - The questions people ask, which show what they didn't understand.
- If time remains, a first version of the brand check overlay.

### Questions to answer by watching, not brainstorming

- Which single moment gets the strongest reaction: the logo reveal, the 20-worlds zoom, mixing in, see it built, or the deck?
- Do people understand what the product is *for* without being told? If not, what is the one sentence that fixes it?
- Do viewers want to try it themselves, or are they content to watch?
- Is the blend engine impressive to strangers, or only to the person who built it?

### Set aside for now

Monetisation and pricing (out of scope by the owner's choice), sound, Easter eggs, the brand check overlay, a live agent run as the main demo moment, a public gallery, accounts, a native Windows app, and showing the full 35 aesthetics and 53 pattern families to first-time viewers.
