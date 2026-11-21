// main.js — boot, game loop, and the state machine for Twilight Market.
// Screens: menu -> playing <-> paused -> sceneComplete -> playing ... ->
// final. All scoring numbers live in scoring.js; all drawing in render.js.

import { SCENES } from './scenes.js';
import {
  findDifferenceAt, foundDifferenceAt, allFound, randomUnfound,
} from './differences.js';
import {
  pointsForFind, starsForScene, accuracyOf, rankTitle,
  HINT_COST, HINTS_PER_SCENE, HINT_COOLDOWN, WRONG_PENALTY_SECONDS,
} from './scoring.js';
import { playFind, playWrong, playHint, playWin, playTick, toggleMute } from './audio.js';
import { attachInput } from './input.js';
import { drawGame, getButtons, LAYOUT } from './render.js';
import { applyShot } from './shots.js';

const BEST_KEY = 'twilight-market-best';

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function saveBest(v) {
  try {
    window.localStorage.setItem(BEST_KEY, String(v));
  } catch {
    // Private mode or file:// — the game plays on without a saved best.
  }
}

const state = {
  screen: 'menu',
  sceneIndex: 0,
  scene: SCENES[0],
  found: new Set(),
  foundAt: new Map(),
  foundCount: 0,
  score: 0,
  combo: 0,
  timeLeft: SCENES[0].timer,
  hintsLeft: HINTS_PER_SCENE,
  hintCooldown: 0,
  hintPulse: null,
  crosshair: { x: 270, y: 270 },
  keyboardMode: false,
  hover: null,
  lens: false,
  floats: [],
  particles: [],
  events: ['Welcome to Twilight Market — find all 28 differences.'],
  wrongFlash: null,
  shake: 0,
  muted: false,
  best: loadBest(),
  newBest: false,
  // Per-scene tallies, reset by startScene().
  sceneCorrect: 0,
  sceneWrong: 0,
  sceneScoreStart: 0,
  sceneScore: 0,
  sceneFound: 0,
  sceneAccuracy: 1,
  sceneTimeLeft: 0,
  sceneStars: 0,
  sceneTimedOut: false,
  sceneResults: [],
  totalScore: 0,
  totalFound: 0,
  rankTitle: '',
  // Shot mode: a frozen animation clock and no live timer.
  shotMode: false,
  frozenNow: null,
  hintButton: { x: 0, y: 0, w: 0, h: 0 },
  lastTickSecond: -1,
};

// ---------------------------------------------------------------- helpers

function screenPos(panel, x, y) {
  const P = LAYOUT.panels;
  return { x: (panel === 'A' ? P.ax : P.bx) + x, y: P.y + y };
}

function burst(sx, sy) {
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.3;
    const speed = 40 + (i % 4) * 22;
    state.particles.push({
      x: sx, y: sy,
      vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30,
      life: 0.7 + (i % 3) * 0.15, birth: nowMs(),
      size: 2.5 + (i % 3), color: i % 3 === 0 ? '#ffd166' : '#ffb347',
    });
  }
}

function nowMs() {
  return state.frozenNow ?? performance.now();
}

function logEvent(text) {
  state.events.push(text);
  if (state.events.length > 12) state.events.shift();
}

// ---------------------------------------------------------------- flow

function startScene() {
  const scene = SCENES[state.sceneIndex];
  state.scene = scene;
  state.found = new Set();
  state.foundAt = new Map();
  state.foundCount = 0;
  state.timeLeft = scene.timer;
  state.hintsLeft = HINTS_PER_SCENE;
  state.hintCooldown = 0;
  state.hintPulse = null;
  state.combo = 0;
  state.sceneCorrect = 0;
  state.sceneWrong = 0;
  state.sceneScoreStart = state.score;
  state.sceneTimedOut = false;
  state.lastTickSecond = -1;
  logEvent(`Scene ${state.sceneIndex + 1}: ${scene.name} — ${scene.diffs.length} differences.`);
}

function startGame() {
  state.score = 0;
  state.sceneResults = [];
  state.totalFound = 0;
  state.newBest = false;
  state.sceneIndex = 0;
  startScene();
  state.screen = 'playing';
}

function completeScene() {
  const scene = state.scene;
  const accuracy = accuracyOf(state.sceneCorrect, state.sceneWrong);
  state.sceneFound = state.foundCount;
  state.sceneAccuracy = accuracy;
  state.sceneTimeLeft = Math.max(0, Math.ceil(state.timeLeft));
  state.sceneScore = state.score - state.sceneScoreStart;
  state.totalScore = state.score;
  state.sceneStars = state.sceneTimedOut ? 0 : starsForScene(state.timeLeft, accuracy);
  state.sceneResults.push({ name: scene.name, stars: state.sceneStars });
  state.totalFound += state.sceneFound;
  state.screen = 'sceneComplete';
  if (!state.sceneTimedOut) playWin();
  logEvent(state.sceneTimedOut
    ? `Time up on ${scene.name} — ${state.sceneFound}/${scene.diffs.length} found.`
    : `${scene.name} complete — ${state.sceneStars} star${state.sceneStars === 1 ? '' : 's'}.`);
}

function finishGame() {
  state.rankTitle = rankTitle(state.score);
  state.totalScore = state.score;
  if (state.score > state.best) {
    state.best = state.score;
    state.newBest = true;
    saveBest(state.score);
  }
  state.screen = 'final';
}

function nextScene() {
  // Only the scene-complete screen advances the game. A call from any
  // other screen (e.g. a test driving next() while still playing) is a
  // no-op: advancing early would skip completeScene() and leave the
  // per-scene results short, which the final screen reads.
  if (state.screen !== 'sceneComplete') return;
  if (state.sceneIndex < SCENES.length - 1) {
    state.sceneIndex++;
    startScene();
    state.screen = 'playing';
  } else {
    finishGame();
  }
}

// ---------------------------------------------------------------- actions

function attemptMark(x, y, panel) {
  if (state.screen !== 'playing') return;
  const scene = state.scene;
  // Re-clicking a spot already ringed is a no-op, never a wrong click.
  if (foundDifferenceAt(scene, x, y, state.found)) return;
  const d = findDifferenceAt(scene, x, y, state.found);
  const pos = screenPos(panel, x, y);
  if (d) {
    state.found.add(d.id);
    state.foundAt.set(d.id, nowMs());
    state.foundCount = state.found.size;
    state.sceneCorrect++;
    state.combo++;
    const pts = pointsForFind(state.timeLeft, state.combo);
    state.score += pts;
    state.floats.push({
      x: pos.x, y: pos.y - 30, text: `+${pts}`, birth: nowMs(), color: '#ffd166',
    });
    burst(pos.x, pos.y);
    playFind();
    logEvent(`+${pts} ${d.name}`);
    document.getElementById('status').textContent =
      `Found ${d.name}. ${state.foundCount} of ${scene.diffs.length}.`;
    if (allFound(scene, state.found)) {
      // Let the last ring finish its pop before the card comes up. The
      // callback only completes the scene it was scheduled for: if the
      // scene has changed since (a stale timer), it does nothing.
      setTimeout(() => {
        if (state.screen === 'playing' && state.scene === scene) completeScene();
      }, 900);
    }
  } else {
    state.sceneWrong++;
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY_SECONDS);
    state.wrongFlash = { x: pos.x, y: pos.y, birth: nowMs() };
    state.shake = 1;
    playWrong();
    logEvent('Wrong click −5s');
    if (state.timeLeft <= 0) {
      state.sceneTimedOut = true;
      completeScene();
    }
  }
}

function useHint() {
  if (state.screen !== 'playing') return;
  if (state.hintsLeft <= 0 || state.hintCooldown > 0) return;
  const target = randomUnfound(state.scene, state.found);
  if (!target) return;
  state.hintsLeft--;
  state.score = Math.max(0, state.score - HINT_COST);
  state.hintCooldown = HINT_COOLDOWN;
  state.hintPulse = { x: target.x, y: target.y, until: nowMs() + 1500 };
  playHint();
  logEvent('Hint used −150 pts');
}

function togglePause() {
  if (state.screen === 'playing') state.screen = 'paused';
  else if (state.screen === 'paused') state.screen = 'playing';
}

function onButton(id) {
  if (id === 'start' || id === 'replay') startGame();
  else if (id === 'hint') useHint();
  else if (id === 'resume') togglePause();
  else if (id === 'next') nextScene();
}

function onConfirm() {
  if (state.screen === 'menu' || state.screen === 'final') startGame();
  else if (state.screen === 'sceneComplete') nextScene();
  else if (state.screen === 'paused') togglePause();
  else if (state.screen === 'playing') attemptMark(state.crosshair.x, state.crosshair.y, 'A');
}

// ---------------------------------------------------------------- boot

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

attachInput(canvas, {
  buttons: () => getButtons(),
  onButton,
  onMark: attemptMark,
  onBackgroundClick: () => {},
  onHover: (hover) => { state.hover = hover; },
  onLens: (on) => { state.lens = on; },
  onCrosshair: (dx, dy) => {
    state.keyboardMode = true;
    state.crosshair.x = Math.max(0, Math.min(540, state.crosshair.x + dx));
    state.crosshair.y = Math.max(0, Math.min(540, state.crosshair.y + dy));
  },
  onConfirm,
  onHint: useHint,
  onMute: () => { state.muted = toggleMute(); },
  onPause: togglePause,
  onAdvance: () => { if (state.screen === 'sceneComplete') nextScene(); },
});

// Deterministic screenshot states: ?shot=cover|scene1|scene3|complete|menu
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyShot(state, shot, { startScene, logEvent });

// The loop: live mode ticks the timer; shot mode freezes everything so a
// screenshot is the same frame every time it is taken.
let lastReal = performance.now();
function frame(realNow) {
  const dt = Math.min(0.05, Math.max(0, (realNow - lastReal) / 1000));
  lastReal = realNow;
  if (!state.shotMode && state.screen === 'playing') {
    state.timeLeft -= dt;
    if (state.hintCooldown > 0) state.hintCooldown -= dt;
    if (state.timeLeft <= 10) {
      const sec = Math.ceil(state.timeLeft);
      if (sec !== state.lastTickSecond && sec > 0) {
        state.lastTickSecond = sec;
        playTick();
      }
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.sceneTimedOut = true;
      completeScene();
    }
  }
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 1.6);
  // Prune spent effects so the arrays stay short.
  const now = nowMs();
  state.floats = state.floats.filter((f) => now - f.birth < 1200);
  state.particles = state.particles.filter((p) => now - p.birth < p.life * 1000 + 100);
  drawGame(ctx, state, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Read-only hook for verification: lets a test drive real clicks and read
// real state without touching the DOM. Part of the shipped game, harmless.
window.__twilight = {
  state,
  mark(x, y, panel = 'A') { attemptMark(x, y, panel); },
  hint() { useHint(); },
  start() { startGame(); },
  next() { nextScene(); },
};
