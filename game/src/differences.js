// differences.js — the difference data model + hit-testing.
// A scene's differences live in scenes.js, next to the art they describe.
// This file only answers questions about them: what did the player just
// click, how many are found, how many remain. `found` is a Set of ids.

import { SCENES } from './scenes.js';

export function sceneAt(index) {
  return SCENES[index];
}

// The nearest still-unfound difference whose circle contains (x, y),
// or null. A click counts when it lands inside a difference's radius.
export function findDifferenceAt(scene, x, y, found) {
  let best = null;
  let bestD2 = Infinity;
  for (const d of scene.diffs) {
    if (found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= d.r * d.r && d2 < bestD2) {
      best = d;
      bestD2 = d2;
    }
  }
  return best;
}

// The nearest ALREADY-found difference at (x, y), or null. Clicking a
// ringed spot is a no-op: the player is re-checking a correct spot, not
// making a wrong guess, so it must not cost time or combo.
export function foundDifferenceAt(scene, x, y, found) {
  for (const d of scene.diffs) {
    if (!found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}

export function foundCount(scene, found) {
  let n = 0;
  for (const d of scene.diffs) if (found.has(d.id)) n++;
  return n;
}

export function remainingCount(scene, found) {
  return scene.diffs.length - foundCount(scene, found);
}

export function allFound(scene, found) {
  return foundCount(scene, found) === scene.diffs.length;
}

// The named checklist for the left rail: each difference with its state.
export function checklist(scene, found) {
  return scene.diffs.map((d) => ({ id: d.id, name: d.name, found: found.has(d.id) }));
}

// A random still-unfound difference, for the hint system.
export function randomUnfound(scene, found) {
  const open = scene.diffs.filter((d) => !found.has(d.id));
  if (open.length === 0) return null;
  return open[Math.floor(Math.random() * open.length)];
}
