// scoring.js — score, combo, timer, hints, stars and rank titles.
// All numbers are the design's exact values. A scripted instant-click
// perfect play-through reaches ~19,600 total (scene 1 alone: 4,600); a
// fast human hunting ~10 s per difference lands ~9,000–12,000. The rank
// bands below are calibrated against those measured totals, not the
// plan's first guess (which put EAGLE EYE at 6,500 — far too easy).

// Combo multiplier by consecutive finds with no miss in between.
export function comboMultiplier(combo) {
  if (combo >= 5) return 2.0;
  if (combo === 4) return 1.75;
  if (combo === 3) return 1.5;
  if (combo === 2) return 1.25;
  return 1.0;
}

// Points for one find: a base that rewards speed, scaled by the combo.
// `combo` is the new combo count after this find (1 for the first find).
export function pointsForFind(timeLeft, combo) {
  const base = 100 + 2 * Math.max(0, timeLeft);
  return Math.round(base * comboMultiplier(combo));
}

// Stars for a finished scene: time left and accuracy both have to clear
// the bar. Accuracy is finds / (finds + wrong clicks).
export function starsForScene(timeLeft, accuracy) {
  if (timeLeft >= 60 && accuracy >= 0.8) return 3;
  if (timeLeft >= 30 && accuracy >= 0.6) return 2;
  return 1;
}

export function accuracyOf(finds, wrong) {
  const total = finds + wrong;
  return total === 0 ? 1 : finds / total;
}

// Final rank titles by total score across all three scenes.
export function rankTitle(total) {
  if (total >= 13000) return 'EAGLE EYE';
  if (total >= 9000) return 'Lantern Detective';
  if (total >= 5000) return 'Sharp-Eyed Shopper';
  return 'Market Browser';
}

// "1:47" from 107 seconds. Never negative, never shows a fraction.
export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export const HINT_COST = 150;
export const HINTS_PER_SCENE = 3;
export const HINT_COOLDOWN = 20;
export const WRONG_PENALTY_SECONDS = 5;
