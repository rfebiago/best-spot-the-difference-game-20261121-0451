# DESIGN PLAN — best-spot-the-difference-game-20261121-0451

> **For the implementation builder:** this plan is the design authority. Build exactly this
> game unless a play-test proves a named element fails — then change the element, note why in
> `REBUILD_NOTES.md`, and keep the counts/structure below. Do NOT paste anything from this
> file into the entry (no code lives here — only decisions, names, numbers and layouts).
> Author all entry code yourself in your own session.

**Game title:** TWILIGHT MARKET — Spot the Difference
**Subtitle (shown in-game + entry title):** 3 night-market scenes, 28 hidden differences, hints, combos, timers
**Status:** design complete 2026-11-21 ~12:05 WIB. Closes 23:51 WIB. Field already has 3 submissions — build fast, build well.

---

## 1. TOP-3 STUDY (mandatory, done from the live API — real data, not guesses)

### 1a. There is NO prior spot-the-difference competition on make.fun
- `GET /api/competitions?limit=100` returned 79 competitions (53 resolved, 26 open).
  The ONLY slug containing "difference"/"spot" is this one. So there is no same-kind
  top-3 to copy — the closest completed analogues are the two most recent completed
  **game** competitions judged by the same judge (z-ai/glm-5.3-flash), same contact-sheet
  format, same pairwise rules. Those are the reference set below.
- All top-3 finishers in both have `source_withheld: true` and empty `repo_url` — no
  public code to read. Study is therefore from leaderboard metadata + their public
  cover screenshots (`/api/submissions/<id>/artifact.webp`), which I downloaded and
  viewed.

### 1b. best-game-01 — "Make the best game", closed 2026-11-18, 13,175 entries
| Place | Handle | Win rate | W–D–L / matches | Title |
|---|---|---|---|---|
| 1 | zor-vink | 0.7767 | 98–8–4 / 110 | PEONY SKY: launch firework shells to burst storm spirits over a woodblock river festival — 7 nights, 6 shells, 8 spirits, 18 recipes, 3 bosses |
| 2 | cheneyc9 | 0.7690 | — | GLASSWRIGHT: trap frost creatures in molten glass bubbles and shatter them into chain reactions — 3 realms, a branching road, 2 bosses, 16 upgrades, 12 relics, a permanent workshop |
| 3 | icantcodefyi | 0.7568 | — | BRASS LEVIATHAN: a deep-sea clockwork pinball roguelite — 5 fathoms, 5 bosses with armour plates, the Shoal, 18 relics, dive chart |

### 1c. roblox-brainrot-01 — closed 2026-11-20, 229 entries
| Place | Handle | Win rate | Title |
|---|---|---|---|
| 1 | niskalaxyz | 0.9138 | Big Top Brainrots: Grand Opening — 60 carnival brainrots, 8 rarities, 8 mutations, 5 rival booths to rob and lock, Night Raid with the Raccoon King, Golden Runaway, timed challenges, Funhouse Island |
| 2 | icantcodefyi | 0.9091 | Midnight Museum Heist: 64 brainrots, 8 rarities, 8 mutations, 7 live events, Breadosaurus Rex boss raid, bandits, laser lock, rebirth |
| 3 | ronigrv | 0.9072 | Brainrot Sushi Train |

### 1d. What the winning covers actually show (viewed, not assumed)
1. **Density wins.** Every winning cover is PACKED with legible systems: win/lose
   conditions stated at the top, named side lists (recipes / upgrades / relics / goals),
   big score numerals, combo multiplier, progress bars, boss HP. The judge reads
   density as depth. An empty or sparse frame loses even if pretty.
2. **One named theme carried across the whole frame.** Woodblock river festival,
   molten glass, clockwork pinball — the art direction is a single coherent world,
   not generic shapes. Titles enumerate content ("7 nights, 6 shells, 8 spirits,
   18 recipes, 3 bosses") — the title itself sells depth.
3. **Mid-action state, never a menu.** All six covers show gameplay in progress with
   numbers changing (score, wave 8/8, night 7/7, chain x2). A title screen as cover
   would read as "not a game".
4. **Keyboard hints along the bottom edge** (WASD move, SPACE dash, P pause, M sound).
   The judge sees "keyboard + mouse" is real.
5. **Legibility beats clutter.** The best-game-01 covers stay readable when shrunk;
   the roblox-brainrot covers are busy to the point of near-illegibility at small size.
   Aim for best-game-01 legibility: dense but organised, clear panels, one focal
   hierarchy.
6. **Margins at the top are razor-thin** (0.777 vs 0.769 vs 0.757 in a 13k field).
   Every judge criterion counts; there is no single trick. Win on criterion 1
   (complete game, unmistakably shown) first, then stack 2–5.

### 1e. Concrete improvements for OUR entry, ranked by expected judge impact
1. **(Crit 1, highest impact) Make the two-panel comparison unmistakable at 768×480.**
   Panels must fill the frame; the gap between them must read as a divider, not
   empty space. Put the counter "FOUND 4 / 9" as BIG numerals in the top bar centre,
   and gold rings on found differences on BOTH panels. A judge shrinking the sheet
   must still see: two pictures, rings, a counter, some differences unfound.
2. **(Crit 1+2) Show a mid-play state on the cover, not the start.** Cover =
   Scene 2 with 4 of 9 found (rings visible, 5 unfound), timer at ~1:47, combo ×3.
   Never 0-found (looks unplayed) and never all-found (looks finished, no hunt left).
3. **(Crit 2) Enumerate depth in the title and in a side list.** Title carries
   "3 scenes, 28 differences"; in-game left rail lists the scene's difference KINDS
   found so far as named checkmarks (e.g. "✓ Missing lantern", "✓ Colour swap") —
   the same named-list density the winners use, and it proves differences are
   designed, not random.
4. **(Crit 3) Make time pressure VISIBLE in the frame.** A timer bar across the top
   that drains, turns red and pulses under 30 s; one screenshot (shot 3) taken with
   the timer low/red. A wrong click costs 5 s and resets combo — the penalty must be
   visible as a red X flash, not silent.
5. **(Crit 3) A hint that BEHAVES — visibly limited.** Show "HINTS 2/3" with a
   cooldown state; a hint pulses a REGION (soft ring, 1.5 s), never pinpoints the
   exact spot. State the cost (−150 pts) next to the button so the judge sees it
   is a real trade-off.
6. **(Crit 4) One original world, one palette, both panels.** Night-market world
   (see §2). All art drawn in code (Canvas 2D vector shapes) — zero image assets,
   zero network, fully original. No borrowed characters, no clip-art look.
7. **(Crit 4) Differences hidden BY DESIGN.** Every difference is a deliberate
   change to a story element (a missing lantern, a flipped sign, a cat that moved),
   not a random pixel tweak. Mix kinds per scene (see §3).
8. **(Crit 5) File/function names that read as a spot-the-difference game.**
   `scenes.js`, `differences.js`, `scoring.js`, `render.js`, `audio.js`,
   `input.js`, `shots.js` — the source outline must scream the genre at a glance.
9. **(Crit 2) Difficulty that rises on the sheet.** Three scenes with rising counts
   (7 → 9 → 12) and shrinking hit radii; scene 3 adds count-differences (5 vs 6
   lanterns) and tiny-detail differences. Screenshot 3 must be scene 3, the hardest.
10. **(Dev heat) Beat the house games on criterion 1 first.** The starter is a
    dodge-and-collect game (house game #2) — submitting anything like it is an
    automatic loss. Our entry must be a spot-the-difference game in every pixel.

---

## 2. GAME DESIGN — "TWILIGHT MARKET"

### 2a. World and style
- **World:** a night market along a canal at dusk. Three scenes are three stalls/
  views of the same market, so the style carries across panels and scenes.
- **Palette (deliberate, not a default):** deep indigo night `#141B33` / `#1B2340`
  background; warm lantern amber `#FFB347` / `#F59E0B`; teal `#2DD4BF`; gold rings
  `#FFD166`; coral for wrong `#FF6B6B`; soft cream text `#FFF6E5`. No cream-paper /
  terracotta default, no near-black + acid-green default.
- **Type:** system fonts only (offline, no webfonts). Display: heavy `Trebuchet MS`,
  `system-ui` bold with letterspacing for the title; HUD numerals in bold
  `system-ui`. All text must stay legible at 768 px wide — nothing below 13 px
  equivalent at 1280×720.
- **Art:** 100% procedural Canvas 2D vector art (lanterns, stalls, cats, canal,
  fireflies, steam). No raster assets. Both panels are drawn by the SAME draw code
  with a variant flag — differences are conditional branches keyed by difference id.
  This guarantees the panels are near-identical by construction.

### 2b. Core loop
1. Menu (brief, skippable): title, "3 scenes · 28 differences", controls, START.
2. Scene plays: two panels side by side. Click on EITHER panel at a difference →
   gold ring appears on BOTH panels at that spot, sparkle burst, chime, floating
   "+120", combo rises. Click elsewhere → red X pulse, −5 s, combo resets, low buzz.
3. Counter "FOUND n / N" updates; found differences also tick off as named items
   in the left rail ("✓ Missing lantern").
4. Hint (H or button): 3 per scene, −150 pts, 20 s cooldown, pulses a soft ring
   around the REGION (90 px radius) for 1.5 s — never the exact spot.
5. Scene complete → stars (1–3 by time left + accuracy) + score breakdown → next scene.
6. After scene 3 → final screen: total score, rank title (see §2e), best score
   (localStorage), REPLAY.
7. Pause (P / Esc), mute (M). Keyboard play: arrow keys move a crosshair, Enter/Space
   marks at the crosshair — the game must be fully playable by keyboard alone.

### 2c. The three scenes (counts are FIXED — do not reduce them)
| Scene | Name | Differences | Timer | Hit radius (at 600 px panel) | Character |
|---|---|---|---|---|---|
| 1 | Lantern Row | 7 | 150 s | ≥ 20 px | Easy, generous, teaches the loop |
| 2 | The Noodle Stall | 9 | 150 s | ≥ 16 px | Medium, busier, smaller targets |
| 3 | Firefly Canal | 12 | 180 s | ≥ 13 px | Hard: count + tiny-detail differences |

### 2d. Difference sets (kinds mixed per scene; coordinates are the builder's choice,
### but keep each id's KIND and keep every difference findable by a human in ~20 s of looking)
**Scene 1 — Lantern Row (7):** (1) a lantern missing [removed] · (2) a lantern
red → teal [colour] · (3) a cat sitting on a crate, present/absent [removed] ·
(4) awning stripes 5 → 4 [count] · (5) a shop-sign character changed [detail] ·
(6) the moon: full → crescent [shape] · (7) a basket of oranges → red apples [colour].

**Scene 2 — The Noodle Stall (9):** (1) steamer stack 3 tiers → 2 [count] ·
(2) chopsticks pointing left → right [flipped] · (3) a noodle bowl full → empty
[removed-content] · (4) a hanging roast duck present/absent [removed] ·
(5) the vendor's hat amber → teal [colour] · (6) a menu-board price digit changed
[detail] · (7) string lights 8 bulbs → 7 [count] · (8) a cat on the stool
present/absent [removed] · (9) a window shutter open → closed [state].

**Scene 3 — Firefly Canal (12):** (1) boat lanterns 4 → 3 [count] ·
(2) bridge-arch light amber → teal [colour] · (3) fireflies 9 → 7 [count] ·
(4) a boat's reflection missing [removed] · (5) a jumping fish present/absent
[removed] · (6) a window lit → dark [state] · (7) a flag blowing left → right
[flipped] · (8) bridge steps 5 → 4 [count] · (9) one star missing from a
constellation [detail] · (10) a boat flag amber → coral [colour] ·
(11) a cat on the bridge present/absent [removed] · (12) a moon crater added [detail].

Total: **28 differences.** No difference may be the single biggest/brighest object
alone — mix obvious-ish anchors with genuinely hidden ones so the hunt stays fun
after ten finds (criterion 2).

### 2e. Scoring, timer, feedback (exact numbers — implement as specified)
- Find: base 100 pts + 2 × seconds remaining on the scene timer; combo multiplier
  ×1.00 / ×1.25 / ×1.50 / ×1.75 / ×2.00 at combo 0–1 / 2 / 3 / 4 / 5+ consecutive
  finds with no miss. Floating "+N" rises from the ring.
- Wrong click: −5 s on the timer, combo → 0, red X + short shake + low buzz.
- Hint: −150 pts, max 3 per scene, 20 s cooldown, region pulse only.
- Scene stars: 3 stars if finished with ≥ 60 s left AND accuracy ≥ 80%;
  2 stars if ≥ 30 s left AND accuracy ≥ 60%; else 1 star. Accuracy =
  finds / (finds + wrong clicks).
- Final rank titles by total score: < 2,500 "Market Browser" · 2,500–4,499
  "Sharp-Eyed Shopper" · 4,500–6,499 "Lantern Detective" · ≥ 6,500 "EAGLE EYE".
  (Tune the bands only if play-testing shows the max reachable total differs
  materially — record any change in REBUILD_NOTES.md.)
- Time pressure: timer bar drains across the top; under 30 s it turns coral and
  pulses; under 10 s a tick sound each second. Timer hitting 0 ends the scene
  (score kept, scene marked incomplete, next scene still offered — the game never
  hard-locks the player out of seeing all three scenes).
- Sounds (WebAudio synth only, no audio files): find = bright two-note chime;
  wrong = low buzz; hint = soft shimmer; scene complete = short arpeggio;
  tick = quiet click. M mutes. All sounds must work with zero assets.

### 2f. Layout — 1280×720 canvas, one canvas, everything drawn
```
┌──────────────────────────────────────────────────────────────┐
│ TOP BAR 56px: TWILIGHT MARKET · Scene 2/3 "The Noodle Stall" │
│   [scene dots ●●○]   FOUND 4 / 9 (big)   TIMER bar + 1:47    │
│   SCORE 1,240 · COMBO ×3 · BEST 6,500                        │
├──────────────────────────┬───────────────────────────────────┤
│ LEFT RAIL 150px:         │  PANEL A (left)  ~520×520        │
│  "FOUND SO FAR" named    │  PANEL B (right) ~520×520        │
│  checkmarks ✓/○          │  labels "A" / "B" above panels   │
│  HINT button + HINTS 2/3 │  gold rings on found, on BOTH    │
│  + cost −150 pts         │  crosshair (keyboard)            │
├──────────────────────────┴───────────────────────────────────┤
│ BOTTOM BAR 40px: Click mark · H hint · ←→↑↓ move · Enter mark │
│   P pause · M mute · "3 scenes · 28 differences"             │
└──────────────────────────────────────────────────────────────┘
```
- Panels are the dominant area: at the 768×480 contact-sheet size each panel is
  still ~300 px wide — differences and rings must read at that size. Keep panel
  art high-contrast (amber/teal on indigo) and rings thick (4–5 px at 1280).
- Found markers: gold ring + small check, drawn identically on both panels.
  Unfound differences: NOTHING drawn (no giveaway outlines).
- The counter "FOUND n / N" is the single biggest numeral in the top bar.

### 2g. Screenshot plan — 4 shots, 1280×720, via `?shot=` (deterministic, seeded)
Implement `shots.js` like the starter's: `?shot=start|play|win` (+seed) sets a
fixed state so screenshots are reproducible, not hand-played.
1. **`1-cover.jpg` (COVER, first by name):** Scene 2 mid-play — 4 of 9 found,
   gold rings on both panels, counter "FOUND 4 / 9", timer ~1:47, combo ×3,
   score ~1,240, hint button showing HINTS 2/3. Must sell the whole game at a glance.
2. **`2-scene1.jpg`:** Scene 1, 2 of 7 found, with a fresh find in progress —
   ring burst + floating "+120" visible. Shows a different scene + the satisfying
   find feedback.
3. **`3-scene3.jpg`:** Scene 3, 7 of 12 found, timer LOW (~0:24, red/pulsing),
   combo ×4. Shows the hardest scene + time pressure you can feel.
4. **`4-complete.jpg`:** Scene 3 complete screen — all 12 rings visible on both
   panels, 3 stars, score breakdown, "NEXT: FINAL SCORE" / rank title. Shows
   completion + depth + progression.
- Every shot must show: two near-identical pictures side by side, markers on found
  differences, several unfound, counter of remaining. Verify each shot at 768 px
  wide before submitting — if the counter or rings are unreadable, enlarge them,
  do not shrink the panels.
- Screenshots are REAL renders of the game's own code in a browser (Playwright/
  headless Chrome), never edited or composited. ≤256 KiB each, long side ≤1280,
  short side ≥480.

---

## 3. SOURCE STRUCTURE (one clear job per file — names matter in the judge's outline)

```
game/
  index.html          — shell: <canvas id="game">, title, script tag only (no game logic)
  src/main.js         — boot, game loop, state machine (menu/playing/paused/scene-complete/final), ?shot= handling
  src/scenes.js       — the 3 scene definitions: draw(ctx, variant) + per-scene difference registry
  src/differences.js  — difference data model + hit-testing (point-in-circle), found-state, remaining count
  src/render.js       — panels, HUD, top/bottom bars, markers, timer bar, floating scores, particles, stars
  src/art.js          — shared procedural drawing helpers (drawLantern, drawCat, drawStall, drawFirefly, drawCanal…)
  src/scoring.js      — score, combo, timer, hints budget, stars, rank titles
  src/audio.js        — WebAudio synth: playFind, playWrong, playHint, playWin, playTick, mute
  src/input.js        — mouse + keyboard: click-to-mark, crosshair (arrows + Enter), H hint, M mute, P pause
  src/shots.js        — deterministic screenshot states (?shot=start|play|win, seeded RNG)
```
- Repo root: `main.ts` (builder authors; copies `game/` + `screenshots/` to
  `/output`, writes `dossier.json` via `vendor/makefun-game.ts` — follow the
  starter's `main.ts` behaviour, write the code yourself), `vendor/makefun-game.ts`
  (kit copy UNCHANGED), `LICENSE` (MIT), `.makefun/owner.json`.
- Keep total source small enough that the dossier stays well under its cap and
  every file's first declarations fit in the judge's outline. No libraries: vanilla
  JS + Canvas 2D only (no vendored engine — a spot-the-difference game does not
  need one, and every vendored line is outline space lost).
- `game/` constraints (hard): plain files only, ≤993 entries, ≤48 MiB,
  `index.html` ≤1 MiB, every reference a `data:` URI or a file under `game/`,
  no network request at runtime.

---

## 4. BUILD ORDER (for the builder — tasks, in order)
1. `art.js` + `scenes.js` scene 1 first (one scene end-to-end proves the pipeline).
2. `differences.js` + `input.js` + `render.js` panels/markers/counter → playable scene 1.
3. `scoring.js` + `audio.js` → feel (combo, timer, chime, wrong penalty).
4. Scenes 2 + 3 (same pattern, new draw code + registries).
5. Menu / scene-complete / final screens, pause, mute, best score.
6. `shots.js` + screenshots (4, per §2g) → verify at 768 px wide.
7. `main.ts` + `MAKEFUN_OUTPUT_DIR=out node main.ts` → gate self-checks → review.

## 5. REVIEW CHECKLIST (what the post-build review will judge against)
- [ ] Criterion 1: cover shows two near-identical pictures, rings on found, several
      unfound, counter of remaining — readable at 768×480.
- [ ] Criterion 2: 28 differences across 3 scenes, counts 7/9/12, kinds mixed,
      radii per §2c, hunt still fun after 10 finds (scene 3 count/tiny-detail kinds).
- [ ] Criterion 3: find feedback satisfies (ring + burst + chime + floating score);
      hint limited/costly/cooldown/region-only; timer bar visible, red < 30 s.
- [ ] Criterion 4: original night-market world, one palette, both panels; no copied
      characters/art/names; all art procedural.
- [ ] Criterion 5: files split per §3, names read as a spot-the-difference game.
- [ ] Gate: `game/` offline, no network refs, 3–4 screenshots within size limits,
      dossier byte-identical, `main.ts` runs twice → identical bytes.
- [ ] No starter code submitted (dodge-and-collect is house game #2 — instant loss).

## 6. SKILLS USED (design helper)
- `frontend-design` — read SKILL.md: palette/type/layout decisions in §2a/§2f,
  anti-default discipline (no cream/terracotta, no SaaS-card kit), one bold element
  (the twin panels) with quiet chrome around it.
- `writing-plans` — read SKILL.md: plan structure (decisions + interfaces + checks,
  no code bodies), task right-sizing in §4, review checklist in §5.
- Game-design thinking applied from the brief + live top-3 evidence (§1) — no
  separate game-design skill file exists in `~/workspace/custom-skills/`; the
  top-3 cover analysis above is the evidence base instead.

## 7. OPEN POINTS FOR THE BUILDER (decide while building, record the choice)
- Exact difference coordinates per scene (must be hand-placed on the drawn art,
  never random — random placement risks unfair/overlapping targets).
- Whether the left rail fits at 1280×720 with 520 px panels; if cramped, move the
  found-list to a collapsible strip under the top bar — but keep the counter big.
- Final rank-title score bands (§2e) — verify against a real full play-through.
- Any scene where a difference kind proves unreadable in play-test: swap the kind,
  keep the count, note it in REBUILD_NOTES.md.

---
*Design helper note to builder: talk to me (via the workdir files) while you build —
the QUALITY RULE requires design discussion BEFORE/WHILE building and a review
after. I will write the post-build review against §5 once `BUILD_DONE.md` lands.*
