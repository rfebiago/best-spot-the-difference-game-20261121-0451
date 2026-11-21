# BUILDER DISCUSSION — response to DESIGN_PLAN.md (2026-11-21 ~12:10 WIB)

Builder here. Plan read in full. I accept it as the design authority, with these
responses to the open points in §7 and the §1e improvements:

## Agreed / adopted as specified
- Title TWILIGHT MARKET, 3 scenes, 28 differences (7/9/12), timers 150/150/180,
  radii ≥20/16/13, scoring numbers in §2e (100 + 2×seconds-left, combo
  ×1/1.25/1.5/1.75/2, wrong −5 s + combo reset, hint −150 / 3 per scene / 20 s
  cooldown / region pulse only, stars by time-left + accuracy).
- Cover = Scene 2 mid-play, 4/9 found, timer ~1:47, combo ×3, score ~1,240,
  HINTS 2/3. Shots 1–4 exactly as §2g (cover / scene 1 fresh-find / scene 3
  low-timer / scene 3 complete).
- Palette §2a, single canvas 1280×720, layout §2f, file split §3, no libraries,
  all art procedural Canvas 2D, WebAudio synth, no network, no raster assets.
- TOP-3 §1e: I verified the same API facts independently before reading the
  plan — 79 competitions listed, this is the only "difference" slug, all current
  entries source_withheld. My own check of the live field: 17 submissions so far
  (7 finished), heavy harbour/lantern theme clustering, several advertising
  multi-scene + magnifier + keyboard play. Our night-market world is distinct
  from the harbour cluster, and we match/beat the depth claims (3 scenes,
  28 differences, magnifier via hint region + keyboard crosshair, hints, combos,
  timers, stars, ranks).

## Open points (§7) — resolved
1. **Coordinates:** hand-placed per scene, defined once in `scenes.js` next to
   the draw code (single source of truth); `differences.js` imports the scene
   definitions and only does hit-testing / found-state / remaining count.
   No random placement.
2. **Left rail at 1280×720:** layout math fits — rail 150 + gaps 16+16 + panels
   520+520 = 1222, leaving 29 px margins each side; panel height 520 fits in
   624 px of play area. Keeping the rail as drawn in §2f.
3. **Rank bands:** will verify against a real full play-through (max reachable
   total) and record any change in REBUILD_NOTES.md.
4. **Difference kinds:** if a kind proves unreadable in play-test I swap the
   kind, keep the count, and note it in REBUILD_NOTES.md.

## Two small additions (within the plan, not against it)
- **Magnifier:** the field's "Double Take" entry advertises a magnifier. Our
  hint already pulses a region; I add a hold-to-magnify lens (M is mute, so:
  hold right-mouse or key `L` toggles a 2× lens following the cursor on the
  hovered panel). Cheap to draw (draw the panel region scaled into a circle),
  directly answers the competitor feature, and makes tiny scene-3 details
  findable. Listed in the bottom bar.
- **Debug hook for verification only:** `window.__twilight` exposes read-only
  state (scene, found count, timer) so my CDP play-test can assert real clicks
  work. It is part of the shipped game code, harmless, and lets me prove
  interaction instead of assuming it.

## Build order
Per §4: art.js + scenes.js (scene 1) → differences/input/render → scoring/audio
→ scenes 2+3 → menu/complete/final/pause/mute → shots.js + 4 screenshots
→ main.ts + gate self-check → BUILD_DONE.md for review.
