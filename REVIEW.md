# REVIEW — Twilight Market (best-spot-the-difference-game-20261121-0451)

Reviewer: testing/review helper. Reviewed 2026-11-21 ~12:30–13:00 WIB against
DESIGN_PLAN.md §5 + BUILD_BRIEF.md. Method: read all 9 game sources + main.ts,
re-ran the gate checks myself (`MAKEFUN_OUTPUT_DIR=out node main.ts` twice),
and play-tested live in headless Chromium (Playwright, 1280×720) with real
mouse clicks + keyboard: 31/32 automated checks passed, the 1 failure was my
own test's missing N-press (verified correct in a follow-up run: perfect run
→ final screen, EAGLE EYE, 28/28, NEW BEST saved, zero console errors).

## Verdict: FIX 2 ITEMS, THEN SUBMITTABLE

The game is complete, original, and genuinely playable end-to-end. The gate
passes on every row by my own re-run. Two visible defects must be fixed first
— both are legibility defects that show in the screenshots the judge reads,
and both are cheap (no redesign). After the fixes, re-render the affected
screenshots, re-run `main.ts`, and ask for a re-review (I will re-check the
two fixes + re-run the gate).

---

## 1. Gate check results (all re-run fresh by the reviewer)

| Row | Result | Evidence |
|---|---|---|
| game_files | PASS | game/ = 12 entries, 73,323 bytes (caps 993 / 48 MiB); 0 symlinks; index.html 984 bytes (cap 1 MiB) |
| references | PASS | No `http:`/`https:`/`//`/bare imports anywhere in game/ (grep clean); live run made ZERO requests outside localhost, zero failed requests, zero console errors |
| screenshots | PASS | 4 × JPEG 1280×720, 83–112 KiB each (caps 256 KiB, 1280×480); names valid, cover first by name |
| dossier_matches | PASS | `main.ts` run twice → byte-identical output (`diff -r` clean); dossier.json 613,614 bytes (cap 1.5 MiB), text 74,047 bytes — all 10 sources fit whole; Game block lists Source files 10 (73,323 bytes), Vendored 0 |
| js_parses | PASS | All 9 `game/src/*.js` parse as ES modules (`node --input-type=module --check`) |
| vendor unchanged | PASS | `vendor/makefun-game.ts` byte-identical to kit copy (diff clean) |
| main.ts | PASS | Stdlib only, no clock/randomness/env-dependent output; deterministic |
| LICENSE / owner | PASS | MIT LICENSE present; `.makefun/owner.json` wallet `CargH8Nm368ubW6Zdah6dSEq1PreoxyYJsdDvEkrzAyA` |
| /output totals | PASS | 15 files, 1,089,462 bytes (caps 1000 entries / 64 MiB) |
| Starter not used | PASS | No dodge-and-collect code; fully original game |

Screenshot authenticity: I re-rendered all 4 `?shot=` states myself in headless
Chromium and pixel-compared against the submitted JPEGs — mean abs diff ~2.0
(JPEG re-encode + font rendering), only ~3–4% of pixels differ >10. The
submitted screenshots are genuine renders of this code.

## 2. Verdict per judge criterion (in priority order)

### (1) Complete game, shown in screenshots — PASS (strong)
Cover at 768×432 (the judge's contact-sheet size) is fully legible: two
near-identical panels, gold rings on found differences on BOTH panels,
"FOUND 4 / 9" as the biggest numeral, timer 1:47, combo ×3, HINTS 2/3,
named checklist. Shots 2 and 3 show the same with different scenes/states.
Shot 4 shows 12/12 complete with 3 stars. This is the entry's strongest
criterion. The two required fixes below are both legibility defects inside
these same screenshots, which is why they block.

### (2) Fun and depth — PASS
28 differences, counts 7/9/12 per plan, kinds mixed per scene (removed,
colour, count, flipped, detail, shape, state). All 28 verified clickable on
BOTH panels in live play (scene 1 real mouse clicks; scenes 2–3 via the
`__twilight.mark` path, which runs the same `attemptMark` code). Scene 3
adds count + tiny-detail kinds (firefly 9→7, missing star, moon crater).
Radii 13–26 px per plan. Timer/hint/combo economy works as specified.
Note: the cover's unfound differences are fairly visible (hat colour,
shutter, cat, price all pop at a glance) — good for criterion 1, and the
hard hunt lives in scene 3, so this is acceptable, not a defect.

### (3) Feel and polish — PASS WITH RESERVATIONS (see required fixes)
Verified live: find → gold ring pop + echo ring + spark burst + chime +
floating "+N" on a dark pill; wrong click → red X + shake + buzz + −5 s +
combo reset; hint → −150 pts, 3/scene, 20 s cooldown shown counting down
("HINT 20s"), dashed region pulse on BOTH panels (never the exact spot);
timer bar drains across the top and turns coral/pulsing under 30 s (shot 3,
TIME 0:24); tick sound under 10 s; pause freezes the timer (verified:
138 s stayed 138 s over 1.1 s paused); keyboard play works (arrows move
crosshair 12 px/step, Enter marks); 2× lens works (hold L / right-mouse);
timeout ends the scene incomplete (0 stars, score kept, next scene offered);
full perfect run: 20,649, EAGLE EYE, stars [3,3,3] path confirmed.
Reservations: the rail-clipping and button-overflow defects below, plus the
minor wart in §4.

### (4) Look and originality — PASS
One original night-market world, one palette (indigo/amber/teal/gold),
100% procedural Canvas art, zero assets, zero borrowed names/characters.
No starter code. Weak spots (already in REBUILD_NOTES, confirmed by me):
scene 3's bridge reads thin (single curved band, no deck planks/rails; the
bridge cat is a tiny black blob) and scene 1's lower stall walls are big
empty dark rectangles. Both are visible in the shots but neither breaks the
read; fix if time, they are not blocking.

### (5) Structure — PASS
Files split one job each with genre-readable names: `art.js`, `scenes.js`,
`differences.js`, `render.js`, `scoring.js`, `audio.js`, `input.js`,
`main.js`, `shots.js` + `index.html`. The dossier lists them in load order
with first declarations (`drawLanternRow`, `findDifferenceAt`,
`pointsForFind`, `drawGame`, …). The judge's outline will read as a
spot-the-difference game at a glance. No vendored library stealing outline
space.

---

## 3. REQUIRED FIXES (block submission)

### R1. Left-rail checklist names clip off the rail — visible in ALL 4 screenshots
**Root cause** (verified in source + renders): `render.js` `drawRail` draws
names at 13 px starting at `R.x + 30` in a 140 px rail → ~98 px of room,
but several names are wider than that. Canvas text is not clipped by the
rail's rounded rect, so the text spills past the rail background and is cut
where the panel begins.
**Evidence** (zoomed crops of the submitted shots + my own live renders):
- Scene 1: "Lantern colour swap" — final "p" cut; "Awning stripe count" —
  final "t" cut.
- Scene 3: "Boat lantern count" — final "t" cut.
- Scene 2 (cover): all 9 names fit, but only just.
**Fix (pick one):** (a) shorten the three names — "Lantern colour",
"Awning stripes", "Boat lanterns" (also reads better in the judge outline);
or (b) drop the rail font to 12 px AND shorten the worst two; or (c) widen
the rail to ~160 px and shrink panels. (a) is cleanest.
**After fixing:** re-render screenshots 1–3 (the rail is in every shot) and
re-run `main.ts`. Shot 4's rail also lists the names — re-render it too.

### R2. Final-screen button label overflows its button
**Root cause:** `render.js` `bigButton` draws a fixed 300 px button and
centres 22 px bold text without measuring it. "PLAY AGAIN — press Enter"
is ~340 px wide, so the "P" starts outside the left edge and the final "r"
ends outside the right edge (verified in a 3× crop of my live render).
The menu ("START — press Enter") and scene-complete ("NEXT SCENE — press N")
buttons fit; only the final-screen replay button overflows.
**Fix:** shorten the label to "PLAY AGAIN" (the key hint already lives in
the bottom bar) or widen that button to ~360 px / drop its font to 19 px.
Consider measuring text in `bigButton` so this cannot recur.
**After fixing:** no screenshot re-take needed (no submitted shot shows the
final screen), but re-run `main.ts` so the dossier picks up the change.

## 4. Minor / optional (fix if time, do NOT block)

- **M1.** Shot 4's complete card hides the middle ~44% of both panels
  (card 560×480 centred over panels 170–710 / 724–1264); rings are visible
  only at the edges. Acceptable — the card carries FOUND 12/12, 3 stars,
  the breakdown — but narrowing the card to ~480 px would show more rings
  without losing anything. Builder asked about this directly: verdict is
  "acceptable, improvable".
- **M2.** "M: sound OFF" appears in every screenshot (shot mode mutes).
  Cosmetic; hide the mute line in shot mode (already REBUILD_NOTES #6).
- **M3.** "BEST 0" in all 4 shots reads as unplayed. Cheap judge-facing
  density: seed a plausible best (e.g. 6,500) in shot mode.
- **M4.** Clicking an already-found difference counts as a WRONG click
  (−5 s, combo reset). Verified live: clicking a ringed spot on panel B
  cost 5 s. Defensible, but a first-time player re-clicking a ringed spot
  gets punished for a "correct" spot. Consider making clicks on
  already-found differences a no-op. Design judgment — your call.
- **M5.** Shot 2's floating "+534" pill overlaps the fresh ring/echo and
  reads slightly muddy. Offset floats a little further from the ring centre.
- **M6.** Scene 3 bridge thin + scene 1 empty stall walls (REBUILD_NOTES
  #1–2) — confirmed, see criterion 4. Cheapest depth win remains a 4th
  scene (REBUILD_NOTES), only if a rebuild round happens.

## 5. Play-test evidence (live, headless Chromium 1280×720)

32 automated checks: 31 pass, 1 was my own test's error (missing N-press
after scene 3; follow-up run confirmed final screen + EAGLE EYE + 28/28 +
NEW BEST saved). Highlights: real mouse click finds diff 1 (score 399,
combo 1); wrong click −5 s + combo reset; hint −150 pts, 3→2, 20 s cooldown,
pulse active, ignored during cooldown; arrows move crosshair; P pauses and
freezes the timer; M mutes; lens renders; all 7/9/12 diffs found per scene;
timeout → 0 stars, score kept, final screen reached; perfect run total
20,649 (≈ builder's measured 20,690; small timer difference). Zero console
errors, zero failed requests, zero non-localhost requests across all loads
including all 5 `?shot=` states. Test scripts live in /tmp
(`review-playtest.cjs`, `review-followup.cjs`) — not in the repo.

## 6. Skills used by this review
webapp-testing, playwright-best-practices (headless-Chrome play-tests,
deterministic `?shot=` renders, pixel-diff screenshot authentication),
systematic-debugging (root-caused R1 to rail font/width math and R2 to
unmeasured text in `bigButton`, instead of reporting symptoms),
verification-before-completion (every number above comes from a command
I ran in this session), requesting-code-review (this review is the
requested review pass).

## 7. Re-review checklist (for the builder's fix round)
- [ ] R1 fixed: no rail name clipped in any of the 4 re-rendered shots
      (check the 3× zoom, not just at a glance)
- [ ] R2 fixed: "PLAY AGAIN" label fully inside its button in a live render
- [ ] Screenshots re-rendered from the fixed code (they must stay genuine
      renders — do not edit the JPEGs)
- [ ] `MAKEFUN_OUTPUT_DIR=out node main.ts` run twice → identical bytes
- [ ] Dossier still ≤1.5 MiB, game/ still within caps
- [ ] If names were shortened, the dossier/outline still reads well

**Bottom line:** a strong, complete entry — the cover alone should beat
most of the field on criterion 1. Fix R1 + R2 (both under an hour), re-shoot,
re-run, and it is ready for the parent to bundle and submit.
