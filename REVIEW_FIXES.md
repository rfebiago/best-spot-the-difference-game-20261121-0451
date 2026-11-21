# REVIEW FIXES — response to REVIEW.md (2026-11-21 ~13:30 WIB)

Builder's fix round for the review verdict "FIX 2 ITEMS, THEN SUBMITTABLE".
All items below are fixed, re-verified live, and committed. Asking for the
re-review the reviewer offered (re-check the two fixes + re-run the gate).

## R1 — rail checklist names clipped (REQUIRED) — FIXED
- 13 names shortened in `game/src/scenes.js` (the 3 flagged + 10 more the
  same measurement caught): "Lantern colour swap"→"Lantern colour",
  "Awning stripe count"→"Awning stripes", "Shop-sign picture"→"Shop sign",
  "Chopstick direction"→"Chopsticks", "Empty noodle bowl"→"Empty bowl",
  "Hanging roast duck"→"Roast duck", "Vendor hat colour"→"Vendor hat",
  "Menu price digit"→"Menu price", "String-light bulb"→"Light bulb",
  "Boat lantern count"→"Boat lanterns", "Bridge arch light"→"Arch light",
  "Cat on the bridge"→"Bridge cat", "Boat flag colour"→"Boat flag".
- Shot event strings in `game/src/shots.js` updated to match.
- Verified: canvas `measureText` at 13 px — all 28 names now ≤97.1 px
  against 98 px of rail room; 3× zoom crops of the cover + scene-1 rails
  show every name ending inside the rail with margin.

## R2 — final-screen replay button overflow (REQUIRED) — FIXED
- Label shortened to "PLAY AGAIN" (measured 131.8 px at bold 22 px vs a
  300 px button).
- `bigButton` in `game/src/render.js` now measures its label and shrinks
  the font until it fits (min 15 px), so no future label can overflow.
- Verified live: perfect run → final screen, "PLAY AGAIN" sits centred
  inside the button (screenshot /tmp/twimarket-final.png, this session).

## M1 — complete card hides the middle of the panels — IMPROVED
- Card narrowed 560→480 px in `drawSceneComplete`; more rings visible at
  the edges. Re-rendered shot 4 shows it.

## M2 / M3 — "M: sound OFF" + "BEST 0" in shots — FIXED
- `baseShot` in `game/src/shots.js` no longer forces mute (rail reads
  "M: sound on") and seeds `state.best = 6500`. All 4 shots show it.

## M4 — re-clicking a found difference counted as wrong — FIXED
- New `foundDifferenceAt` in `game/src/differences.js`; `attemptMark`
  returns early on a ringed spot (no −5 s, no combo reset, no event).
- Verified with real CDP mouse clicks: click diff 1 → 399 pts, combo 1;
  click the same spot again → found/score/combo unchanged, timeLeft
  drops only by the timer tick (0.5 s over 0.4 s of waiting).

## M5 — "+534" pill muddy over the ring — FIXED
- Float offset −10 → −30 px above the ring centre in `main.js` and in
  the scene-1 shot preset. Re-rendered shot 2 reads cleanly.

## M6 — bridge thin + empty stall walls — IMPROVED (light)
- Scene 3: deck planks + handrail posts/top rail on the bridge.
- Scene 1: paper fans on stall 1's wall, dried-chilli string on stall 2's.
- Both are pure decoration (no `v` branch), no diff moved. Visible in
  re-rendered shots 2 and 3.

## Extra: latent state-machine bug found by this fix round (not in REVIEW.md)
- Calling `nextScene()` while still playing (a test driving `next()` right
  after the last find, before the 900 ms delayed `completeScene()` fires)
  skipped `completeScene()`, so `sceneResults` came up short and
  `drawFinal` threw on `sceneResults[i].name`. A real player could not
  reach it (advance is only offered on the scene-complete screen), but it
  is a real crash path for any driver.
- Fixed three ways in `game/src/main.js` / `game/src/render.js`:
  `nextScene()` is a no-op unless the screen is `sceneComplete`; the
  delayed completion checks the scene it was scheduled for; `drawFinal`
  skips a missing result row instead of crashing.
- Verified: perfect run 28/28 → final screen, EAGLE EYE, 20,646,
  stars [3,3,3], NEW BEST saved, zero console exceptions. Early `next()`
  while playing confirmed a no-op.

## Re-verification (this round, all fresh)
- All 9 `game/src/*.js` parse as ES modules.
- All 4 screenshots re-rendered from the fixed code (1280×720 JPEG,
  85–116 KiB): cover 4/9, 1,635; scene1 3/7, 1,368; scene3 7/12, 2,899;
  complete 12/12, 9,840 — states match the presets exactly.
- `MAKEFUN_OUTPUT_DIR=out node main.ts` run twice → byte-identical
  (`diff -r` clean). Dossier 622,492 bytes (cap 1.5 MiB), text 77,469
  bytes (cap 163,840), game/ 12 entries / 73 KiB, /output 15 files /
  1,105,782 bytes.
- Perfect-play total re-measured post-fix: 20,646 (timer-dependent;
  earlier runs 20,690 / 20,649 — rank bands unchanged, EAGLE EYE ≥13,000).

## Re-review checklist (from REVIEW.md §7)
- [x] R1 fixed: no rail name clipped in any of the 4 re-rendered shots
      (3× zoom checked, not just at a glance)
- [x] R2 fixed: "PLAY AGAIN" fully inside its button in a live render
- [x] Screenshots re-rendered from the fixed code (genuine renders)
- [x] `main.ts` run twice → identical bytes
- [x] Dossier still ≤1.5 MiB, game/ still within caps
- [x] Shortened names still read well in the dossier/outline
