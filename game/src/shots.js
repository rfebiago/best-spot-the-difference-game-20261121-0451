// shots.js — deterministic screenshot states, set from ?shot=<name>.
// Each preset is a fixed mid-play (or finished) state so a screenshot is
// the same frame every time: same found differences, same timer, same
// score. The numbers are internally consistent with scoring.js — the
// points shown are what those finds at those times would actually pay.
// Live play never calls this file.

import { SCENES } from './scenes.js';
import { LAYOUT } from './render.js';

const FROZEN = 100000; // the animation clock stops here in shot mode

function panelScreen(panel, x, y) {
  const P = LAYOUT.panels;
  return { x: (panel === 'A' ? P.ax : P.bx) + x, y: P.y + y };
}

function presetFound(state, ids, freshId = null) {
  state.found = new Set(ids);
  const at = new Map();
  ids.forEach((id, i) => {
    // Staggered into the past: every ring is settled (age > 0.5 s) and no
    // timestamp ever lands after the frozen clock.
    at.set(id, id === freshId ? FROZEN - 600 : FROZEN - 6000 - i * 700);
  });
  state.foundAt = at;
  state.foundCount = ids.length;
}

function baseShot(state, sceneIndex) {
  state.frozenNow = FROZEN;
  state.shotMode = true;
  // No forced mute: the rail reads "M: sound on", not "sound OFF".
  // A plausible best, so the rail reads as played, not fresh.
  state.best = 6500;
  state.keyboardMode = false;
  state.lens = false;
  state.hover = null;
  state.wrongFlash = null;
  state.shake = 0;
  state.sceneIndex = sceneIndex;
  state.scene = SCENES[sceneIndex];
  state.sceneScoreStart = 0;
  state.events = [];
  state.floats = [];
  state.particles = [];
}

export function applyShot(state, name) {
  // Cover: scene 2 mid-play — 4 of 9 found, rings on both panels, the
  // counter reading FOUND 4 / 9, timer 1:47, combo x3, HINTS 2/3.
  if (name === 'cover') {
    baseShot(state, 1);
    state.screen = 'playing';
    const ids = ['s2-steamer', 's2-chopsticks', 's2-bowl', 's2-duck'];
    presetFound(state, ids);
    state.score = 1635;
    state.combo = 3;
    state.sceneCorrect = 4;
    state.sceneWrong = 1;
    state.timeLeft = 107;
    state.hintsLeft = 2;
    state.hintCooldown = 0;
    state.events = [
      '+384 Steamer tiers',
      'Wrong click −5s',
      '+360 Chopsticks',
      '+420 Empty bowl',
      '+471 Roast duck',
    ];
    return;
  }

  // Scene 1 with a fresh find in progress: ring mid-pop, echo ring,
  // floating +534, spark burst — the satisfying find, frozen mid-flight.
  if (name === 'scene1') {
    baseShot(state, 0);
    state.screen = 'playing';
    const ids = ['s1-lantern-missing', 's1-lantern-colour', 's1-cat'];
    presetFound(state, ids, 's1-cat');
    state.score = 1368;
    state.combo = 3;
    state.sceneCorrect = 3;
    state.sceneWrong = 0;
    state.timeLeft = 128;
    state.hintsLeft = 3;
    state.hintCooldown = 0;
    const pos = panelScreen('A', 62, 388);
    state.floats = [{ x: pos.x, y: pos.y - 30, text: '+534', birth: FROZEN - 600, color: '#ffd166' }];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.3;
      const speed = 40 + (i % 4) * 22;
      state.particles.push({
        x: pos.x, y: pos.y,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 30,
        life: 0.7 + (i % 3) * 0.15, birth: FROZEN - 600,
        size: 2.5 + (i % 3), color: i % 3 === 0 ? '#ffd166' : '#ffb347',
      });
    }
    state.events = [
      '+384 Missing lantern',
      '+450 Lantern colour',
      '+534 Cat on the crate',
    ];
    return;
  }

  // Scene 3, the hardest, with the timer low and red: 7 of 12 found,
  // 0:24 left, combo x4 — time pressure you can feel in the frame.
  if (name === 'scene3') {
    baseShot(state, 2);
    state.screen = 'playing';
    const ids = ['s3-boat-lanterns', 's3-arch-light', 's3-firefly',
      's3-reflection', 's3-fish', 's3-window', 's3-flag'];
    presetFound(state, ids);
    state.score = 2899;
    state.combo = 4;
    state.sceneCorrect = 7;
    state.sceneWrong = 1;
    state.timeLeft = 24;
    state.hintsLeft = 1;
    state.hintCooldown = 0;
    state.events = [
      '+340 Boat reflection',
      '+375 Jumping fish',
      '+360 Dark window',
      '+259 Flag direction',
    ];
    return;
  }

  // Scene 3 complete: all 12 rings on both panels, 3 stars, the score
  // breakdown, and the way on to the final score.
  if (name === 'complete') {
    baseShot(state, 2);
    state.screen = 'sceneComplete';
    const ids = SCENES[2].diffs.map((d) => d.id);
    presetFound(state, ids);
    state.sceneFound = 12;
    state.sceneCorrect = 12;
    state.sceneWrong = 1;
    state.sceneAccuracy = 12 / 13;
    state.sceneTimeLeft = 75;
    state.sceneScore = 5200;
    state.totalScore = 9840;
    state.sceneStars = 3;
    state.sceneTimedOut = false;
    state.score = 9840;
    state.combo = 7;
    state.timeLeft = 75;
    state.hintsLeft = 1;
    state.events = [
      'Scene 3: Firefly Canal — 12 differences.',
      '+610 Moon crater',
      'Firefly Canal complete — 3 stars.',
    ];
    return;
  }

  // Menu (and any unknown ?shot=): the title screen over scene 1.
  baseShot(state, 0);
  state.screen = 'menu';
  state.timeLeft = SCENES[0].timer;
}
