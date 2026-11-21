# BUILD DONE — Twilight Market (best-spot-the-difference-game-20261121-0451)

Builder's build is ready for review. Review helper: please write `REVIEW.md`
in this workdir against DESIGN_PLAN.md §5 (the review checklist). I will
fix what you find lacking, then re-review if needed.

## What was built
**TWILIGHT MARKET — Spot the Difference.** An original, complete
spot-the-difference game: 3 night-market scenes, 28 hand-placed hidden
differences (7/9/12), two near-identical procedural Canvas panels side by
side, gold rings on found differences (both panels), a big FOUND n/N
counter, draining timer bar (red + pulsing under 30 s), hints (3/scene,
−150 pts, 20 s cooldown, region pulse only), combo multipliers, stars,
rank titles, pause/mute, full keyboard play (arrows + Enter), a 2×
magnifier lens (hold L / right-mouse), WebAudio synth sounds, best score.
All art is procedural Canvas 2D; zero image/audio assets; zero network
requests. The kit starter (a dodge-and-collect game) was NOT used.

## Files (repo: this workdir, git init done, 3 commits)
- `game/index.html` — shell, canvas 1280×720, module script only
- `game/src/art.js` — palette + shared procedural drawing helpers + seeded RNG
- `game/src/scenes.js` — 3 scenes (Lantern Row / The Noodle Stall / Firefly Canal), draw + 28 diffs
- `game/src/differences.js` — hit-testing, found-state, remaining count
- `game/src/render.js` — frame, HUD, panels, markers, timer bar, overlays, lens
- `game/src/scoring.js` — score/combo/timer/hints/stars/ranks
- `game/src/audio.js` — WebAudio synth (chime/buzz/shimmer/arpeggio/tick)
- `game/src/input.js` — mouse + keyboard
- `game/src/main.js` — boot, loop, state machine, `?shot=` handling, `__twilight` debug hook
- `game/src/shots.js` — deterministic screenshot states (?shot=cover|scene1|scene3|complete|menu)
- `main.ts` — hand-in program (authored by me; copies game/ + screenshots/, writes dossier.json)
- `vendor/makefun-game.ts` — kit copy, byte-identical (sha256 dc671875… verified)
- `LICENSE` (MIT), `.makefun/owner.json` (wallet CargH8Nm368ubW6Zdah6dSEq1PreoxyYJsdDvEkrzAyA)
- `screenshots/` — 4 real renders, 1280×720 JPEG: 1-cover (scene 2, 4/9 found, 1:47, ×3),
  2-scene1 (fresh find +534 mid-pop), 3-scene3 (7/12, 0:24 red), 4-complete (12/12, 3 stars)
- `REBUILD_NOTES.md` — weaknesses + rebuild ideas + fixes already applied

## Local verification (all run in this session, evidence in the transcript)
- `MAKEFUN_OUTPUT_DIR=out node main.ts` run twice → **byte-identical output**
  (diff -r clean). Dossier 613,614 bytes (cap 1.5 MiB), text 74,047 bytes
  (cap 163,840 — all sources fit whole). game/ 12 entries / 73 KiB
  (caps 993 / 48 MiB). index.html 984 bytes (cap 1 MiB).
- Screenshots: 4 × 1280×720 JPEG, 83–112 KiB each (cap 256 KiB); long side
  ≤1280, short side ≥480. Viewed each one: two panels, rings, counter of
  remaining all readable at a glance.
- No network references anywhere in game/ (grep clean); all imports relative.
- Zero console exceptions across all 4 shot loads + full play-throughs.
- Interactive play-through via real CDP mouse clicks + keyboard:
  scene 1 all 7 diffs found (points 400/500/390/488/585/683/780 — combo and
  hint/wrong math verified), wrong click −5 s + combo reset + red X,
  hint −150 pts + region pulse + 20 s cooldown; scenes 2+3 all diffs
  clickable (9/9, 12/12); pause/resume, crosshair, mute all work;
  timeout ends the scene incomplete (0 stars, score kept); full perfect
  run: 28/28 found, total 20,690, EAGLE EYE, stars [3,3,3].
- Rank bands re-tuned from the plan's first guess (see REBUILD_NOTES.md):
  measured perfect-play max is 20,690, not ~6,500.

## Skills used
- frontend-design (palette/type/layout, anti-default discipline)
- writing-plans (plan structure; the design helper's plan was the spec)
- webapp-testing + playwright-best-practices (headless-Chrome CDP play-tests,
  deterministic ?shot= states, screenshot verification)
- systematic-debugging (root-caused the negative-radius throw and the
  1280×527 viewport squish instead of patching symptoms)
- verification-before-completion (no claim without a fresh run: every number
  above comes from a command run in this session)
- design-game + game-feel (find feedback: ring pop + echo + burst + chime +
  floating score; wrong-click shake + buzz; timer-bar pressure)
- subagent-driven-development / dispatching-parallel-agents (worked from the
  design helper's plan; this BUILD_DONE hands off to the review helper)
- find-skills (located the skills above)

## Skills NOT used / useless for this bounty
- test-driven-development (no test framework for a canvas game in this
  harness; replaced by CDP play-throughs + node smoke runs)
- vercel-react-best-practices, deploy-to-vercel (static files, no React,
  no deploy — the entry is handed in as files, not hosted)
- using-git-worktrees, requesting-code-review (single-session build in an
  existing repo; review happens via the review helper + REVIEW.md)
- executing-plans (execution method was already fixed by the task: I am the
  builder implementing in my own session)
- skill-creator (no reusable workflow worth extracting beyond the CDP
  driver, which lives in /tmp as task tooling)
- Content skills (social-content, copywriting, etc.) — the bounty needs no
  creative/copy beyond in-game labels, which the design plan fixed.

## Design decisions (mine, inside the plan)
- Left rail kept (layout math fits: 150 + 16 + 540 + 16 + 540 = 1262 ≤ 1280).
- Coordinates hand-placed, defined once in scenes.js next to the draw code;
  differences.js only hit-tests (single source of truth).
- Rank bands re-tuned on measured totals (see above).
- Added a 2× magnifier lens (hold L / right-mouse) — the field's "Double
  Take" entry advertises one; ours answers it and makes tiny scene-3
  details findable.
- Floating scores ride a dark pill (gold on amber jars was invisible).
- Shot presets' points are internally consistent with scoring.js
  (e.g. cover 1,635 = 384+360+420+471 for its find sequence).
- `window.__twilight` read-only debug hook ships in the game so any
  reviewer can drive real clicks and read real state.

## Known deviations from DESIGN_PLAN.md
- Rank bands changed (plan §2e): <5,000 / 5,000–8,999 / 9,000–12,999 /
  ≥13,000 (was <2,500 / 2,500–4,499 / 4,500–6,499 / ≥6,500). Reason:
  measured perfect-play max is 20,690; the old EAGLE EYE band was far too
  easy. Plan explicitly allows tuning bands on play-through evidence.
- Cover score is 1,635, not the plan's rough "~1,240": the 1,635 is what
  the cover's find sequence actually pays at timer 1:47; consistency wins
  over the rough estimate.
- Scene 1 diff 5 is a shop-sign *picture* (lantern → bowl), not a sign
  *character* (茶/酒): CJK glyphs risk tofu boxes in headless Chrome
  without CJK fonts; a drawn pictogram is font-proof. Kind stays 'detail',
  count unchanged.

## For the reviewer
Please check against DESIGN_PLAN.md §5, and in particular: cover
legibility at 768 px wide, whether scene 3's bridge reads, whether any
difference is unfair (too hidden / overlapping another), and whether the
complete card hides too much of the panels. I am standing by to fix.
