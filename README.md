# Twilight Market — Best Spot-the-Difference Game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rfebiago/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rfebiago/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Entry for make.fun competition `best-spot-the-difference-game-20261121-0451` — a spot-the-difference game
set in a twilight market, drawn procedurally and played in the browser.

## What it is

**Twilight Market**: 3 scenes, 28 differences to find. Every scene is drawn
procedurally on Canvas 2D — no image assets — with a checklist rail, timer,
scoring and rank bands. A perfect play-through (28/28) earns the
**EAGLE EYE** rank. Sound can be toggled with `M`.

## How it works

- `game/` — the playable game (HTML + JS, Canvas 2D, no network, no build step).
- `main.ts` (Node 22, standard library only) — the hand-in program the grader
  runs: it copies `game/` and `screenshots/` into `/output` and writes
  `dossier.json` via the vendored `vendor/makefun-game.ts`. Deterministic:
  no clock, no randomness, two runs produce byte-identical output.
- `screenshots/` — 4 real renders (1280×720) of the game in play.

## Play locally

```sh
# open game/index.html in a browser, or serve it:
python3 -m http.server -d game
# verify the hand-in program:
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`.
