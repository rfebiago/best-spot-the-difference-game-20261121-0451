// render.js — everything the player sees: the frame, the HUD, the two
// panels, the markers on found differences, the timer bar, the event
// strip, the overlays, and the magnifier lens. One canvas, 1280x720.
// Each panel is drawn to its own offscreen canvas first (scene + markers),
// then blitted — the lens samples the same offscreen canvas at 2x.

import { PALETTE, circle, roundRect } from './art.js';
import { PANEL } from './scenes.js';
import { formatTime } from './scoring.js';

export const LAYOUT = {
  topBar: { h: 56 },
  rail: { x: 16, y: 64, w: 140, h: 608 },
  panels: { ax: 170, bx: 724, y: 70, size: PANEL },
  strip: { x: 170, y: 618, w: 1094, h: 54 },
  bottomBar: { y: 680, h: 40 },
};

const FONT_DISPLAY = '"Trebuchet MS", system-ui, sans-serif';

let panelA = null;
let panelB = null;
let buttons = [];

export function getButtons() {
  return buttons;
}

function setButtons(list) {
  buttons = list;
}

function offscreen() {
  if (!panelA) {
    panelA = document.createElement('canvas');
    panelA.width = PANEL;
    panelA.height = PANEL;
    panelB = document.createElement('canvas');
    panelB.width = PANEL;
    panelB.height = PANEL;
  }
  return [panelA, panelB];
}

function text(ctx, s, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

// Draw one panel: the scene variant, then rings on every found difference,
// the hint pulse, and the keyboard crosshair.
function drawPanel(off, scene, variant, state, t, now) {
  const ctx = off.getContext('2d');
  ctx.clearRect(0, 0, PANEL, PANEL);
  scene.draw(ctx, variant, t);

  for (const d of scene.diffs) {
    if (!state.found.has(d.id)) continue;
    // Age is clamped at zero: a foundAt in the future (a preset, a clock
    // jump) must never make a ring radius go negative and throw.
    const age = Math.max(0, (now - (state.foundAt.get(d.id) ?? now)) / 1000);
    const pop = age < 0.5 ? 1 + 0.35 * (1 - age / 0.5) : 1;
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(d.x, d.y, (d.r + 5) * pop, 0, Math.PI * 2);
    ctx.stroke();
    // Small gold check inside the ring.
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(d.x - 7, d.y);
    ctx.lineTo(d.x - 1.5, d.y + 5.5);
    ctx.lineTo(d.x + 8, d.y - 6);
    ctx.stroke();
    // The fresh find gets an expanding echo ring.
    if (age < 0.7) {
      ctx.strokeStyle = `rgba(255, 209, 102, ${0.7 * (1 - age / 0.7)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(d.x, d.y, (d.r + 5) + age * 46, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (state.hintPulse && now < state.hintPulse.until) {
    const alpha = 0.35 + 0.35 * Math.sin(now / 90);
    ctx.strokeStyle = `rgba(255, 209, 102, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(state.hintPulse.x, state.hintPulse.y, 90, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (state.keyboardMode) {
    const { x, y } = state.crosshair;
    ctx.strokeStyle = PALETTE.teal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x, y + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- top bar

function drawTopBar(ctx, state, scene, now) {
  const L = LAYOUT;
  // Timer bar across the very top: drains left to right.
  const frac = Math.max(0, state.timeLeft / scene.timer);
  const low = state.timeLeft < 30;
  const pulse = low ? 0.6 + 0.4 * Math.sin(now / 120) : 1;
  ctx.fillStyle = 'rgba(255, 246, 229, 0.12)';
  ctx.fillRect(0, 0, 1280, 6);
  ctx.fillStyle = low ? PALETTE.coral : PALETTE.teal;
  ctx.globalAlpha = pulse;
  ctx.fillRect(0, 0, 1280 * frac, 6);
  ctx.globalAlpha = 1;

  // Title + scene line, left.
  text(ctx, 'TWILIGHT MARKET', 16, 28, `bold 22px ${FONT_DISPLAY}`, PALETTE.cream);
  const dots = [0, 1, 2].map((i) =>
    i < state.sceneIndex ? '●' : i === state.sceneIndex ? '◉' : '○').join(' ');
  text(ctx, `${dots}  Scene ${state.sceneIndex + 1}/3 — ${scene.name}`,
    16, 48, `14px ${FONT_DISPLAY}`, PALETTE.creamDim);

  // The counter: the single biggest numeral in the bar.
  const found = state.foundCount;
  text(ctx, `FOUND ${found} / ${scene.diffs.length}`, 640, 36,
    `bold 32px ${FONT_DISPLAY}`, PALETTE.gold, 'center');

  // Score, combo, time, best — right.
  const combo = state.combo > 1 ? `  COMBO ×${state.combo}` : '';
  text(ctx, `SCORE ${state.score.toLocaleString('en-US')}${combo}`, 1264, 26,
    `bold 18px ${FONT_DISPLAY}`, PALETTE.cream, 'right');
  text(ctx, `TIME ${formatTime(state.timeLeft)}   BEST ${state.best.toLocaleString('en-US')}`,
    1264, 48, `15px ${FONT_DISPLAY}`, low ? PALETTE.coral : PALETTE.creamDim, 'right');
}

// ---------------------------------------------------------------- left rail

function drawRail(ctx, state, scene) {
  const R = LAYOUT.rail;
  ctx.fillStyle = 'rgba(255, 246, 229, 0.05)';
  roundRect(ctx, R.x, R.y, R.w, R.h, 10);
  ctx.fill();
  text(ctx, 'FOUND SO FAR', R.x + 12, R.y + 24, `bold 13px ${FONT_DISPLAY}`, PALETTE.creamDim);
  ctx.strokeStyle = 'rgba(255, 246, 229, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(R.x + 12, R.y + 32);
  ctx.lineTo(R.x + R.w - 12, R.y + 32);
  ctx.stroke();

  let y = R.y + 56;
  for (const d of scene.diffs) {
    const isFound = state.found.has(d.id);
    const mark = isFound ? '✓' : '○';
    const color = isFound ? PALETTE.gold : PALETTE.creamDim;
    text(ctx, mark, R.x + 12, y, `bold 13px ${FONT_DISPLAY}`, color);
    text(ctx, d.name, R.x + 30, y, `13px ${FONT_DISPLAY}`,
      isFound ? PALETTE.cream : 'rgba(216, 205, 180, 0.55)');
    y += 22;
  }

  // Hint button: limited, costly, on cooldown — a real trade-off.
  const hy = R.y + 56 + scene.diffs.length * 22 + 14;
  const cooling = state.hintCooldown > 0;
  const canHint = state.hintsLeft > 0 && !cooling && state.screen === 'playing';
  ctx.fillStyle = canHint ? PALETTE.amberDeep : 'rgba(255, 246, 229, 0.14)';
  roundRect(ctx, R.x + 12, hy, R.w - 24, 40, 8);
  ctx.fill();
  text(ctx, cooling ? `HINT ${Math.ceil(state.hintCooldown)}s` : 'HINT  (H)',
    R.x + R.w / 2, hy + 26, `bold 14px ${FONT_DISPLAY}`,
    canHint ? '#141b33' : PALETTE.creamDim, 'center');
  text(ctx, `HINTS ${state.hintsLeft}/3 · −150 pts`, R.x + R.w / 2, hy + 58,
    `12px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  text(ctx, 'Hold L for lens', R.x + R.w / 2, hy + 78,
    `12px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  text(ctx, state.muted ? 'M: sound OFF' : 'M: sound on', R.x + R.w / 2, hy + 98,
    `12px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  state.hintButton = { x: R.x + 12, y: hy, w: R.w - 24, h: 40 };
}

// ---------------------------------------------------------------- overlays

function dim(ctx, alpha = 0.72) {
  ctx.fillStyle = `rgba(12, 17, 34, ${alpha})`;
  ctx.fillRect(0, 0, 1280, 720);
}

function bigButton(ctx, id, label, x, y, w, h, enabled = true) {
  ctx.fillStyle = enabled ? PALETTE.gold : 'rgba(255, 246, 229, 0.2)';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  // The label is measured and shrunk to fit, so a long label can never
  // spill past the button's edges (the final screen's replay label did).
  let size = 22;
  ctx.font = `bold ${size}px ${FONT_DISPLAY}`;
  while (size > 15 && ctx.measureText(label).width > w - 24) {
    size -= 1;
    ctx.font = `bold ${size}px ${FONT_DISPLAY}`;
  }
  text(ctx, label, x + w / 2, y + h / 2 + 8, `bold ${size}px ${FONT_DISPLAY}`,
    enabled ? '#141b33' : PALETTE.creamDim, 'center');
  return { id, x, y, w, h };
}

function drawStars(ctx, cx, y, stars, size = 34) {
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * (size + 22);
    ctx.fillStyle = i < stars ? PALETTE.gold : 'rgba(255, 246, 229, 0.22)';
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 === 0 ? size / 2 : size / 4.5;
      const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawMenu(ctx, state) {
  dim(ctx, 0.66);
  text(ctx, 'TWILIGHT MARKET', 640, 190, `bold 64px ${FONT_DISPLAY}`, PALETTE.gold, 'center');
  text(ctx, 'Spot the Difference', 640, 236, `bold 30px ${FONT_DISPLAY}`, PALETTE.cream, 'center');
  text(ctx, '3 night-market scenes · 28 hidden differences · hints, combos, timers',
    640, 278, `18px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  text(ctx, 'Click a difference on either picture — a gold ring marks it on both.',
    640, 330, `16px ${FONT_DISPLAY}`, PALETTE.cream, 'center');
  text(ctx, 'Wrong click: −5 seconds.  Hint: −150 points, 3 per scene.',
    640, 356, `16px ${FONT_DISPLAY}`, PALETTE.cream, 'center');
  text(ctx, 'Arrows move the crosshair · Enter marks · H hint · L lens · P pause · M mute',
    640, 382, `15px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  if (state.best > 0) {
    text(ctx, `Best score: ${state.best.toLocaleString('en-US')}`, 640, 420,
      `bold 17px ${FONT_DISPLAY}`, PALETTE.teal, 'center');
  }
  const b = bigButton(ctx, 'start', 'START  —  press Enter', 490, 452, 300, 64);
  setButtons([b]);
  text(ctx, 'A game about looking closely. Nothing here is borrowed.',
    640, 556, `13px ${FONT_DISPLAY}`, 'rgba(216, 205, 180, 0.6)', 'center');
}

function drawPaused(ctx) {
  dim(ctx, 0.7);
  text(ctx, 'PAUSED', 640, 300, `bold 52px ${FONT_DISPLAY}`, PALETTE.cream, 'center');
  text(ctx, 'The market waits. Press P to keep hunting.', 640, 344,
    `18px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  const b = bigButton(ctx, 'resume', 'RESUME', 490, 380, 300, 60);
  setButtons([b]);
}

function drawSceneComplete(ctx, state) {
  dim(ctx, 0.66);
  // Narrow card (480 px): the middle of both panels stays visible behind
  // it, so the found rings still show at the edges.
  const card = { x: 400, y: 110, w: 480, h: 480 };
  ctx.fillStyle = PALETTE.nightMid;
  roundRect(ctx, card.x, card.y, card.w, card.h, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, card.x, card.y, card.w, card.h, 16);
  ctx.stroke();

  const timedOut = state.sceneTimedOut;
  text(ctx, timedOut ? 'TIME UP!' : 'SCENE COMPLETE!', 640, card.y + 56,
    `bold 34px ${FONT_DISPLAY}`, timedOut ? PALETTE.coral : PALETTE.gold, 'center');
  text(ctx, timedOut
    ? `The ${state.scene.name} stall closes — score kept, hunt continues.`
    : state.scene.sub, 640, card.y + 88, `15px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  drawStars(ctx, 640, card.y + 140, timedOut ? 0 : state.sceneStars);
  const lines = [
    ['Found', `${state.sceneFound} / ${state.scene.diffs.length}`],
    ['Accuracy', `${Math.round(state.sceneAccuracy * 100)}%`],
    ['Time left', formatTime(state.sceneTimeLeft)],
    ['Scene score', `+${state.sceneScore.toLocaleString('en-US')}`],
    ['Total score', state.totalScore.toLocaleString('en-US')],
  ];
  let y = card.y + 210;
  for (const [k, v] of lines) {
    text(ctx, k, card.x + 70, y, `17px ${FONT_DISPLAY}`, PALETTE.creamDim);
    text(ctx, v, card.x + card.w - 70, y, `bold 17px ${FONT_DISPLAY}`, PALETTE.cream, 'right');
    y += 34;
  }
  const last = state.sceneIndex === 2;
  const b = bigButton(ctx, 'next', last ? 'SEE FINAL SCORE' : 'NEXT SCENE  —  press N',
    490, card.y + 400, 300, 56);
  setButtons([b]);
}

function drawFinal(ctx, state) {
  dim(ctx, 0.66);
  const card = { x: 360, y: 92, w: 560, h: 536 };
  ctx.fillStyle = PALETTE.nightMid;
  roundRect(ctx, card.x, card.y, card.w, card.h, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, card.x, card.y, card.w, card.h, 16);
  ctx.stroke();

  text(ctx, 'FINAL SCORE', 640, card.y + 54, `bold 34px ${FONT_DISPLAY}`, PALETTE.gold, 'center');
  text(ctx, state.totalScore.toLocaleString('en-US'), 640, card.y + 122,
    `bold 56px ${FONT_DISPLAY}`, PALETTE.cream, 'center');
  text(ctx, state.rankTitle, 640, card.y + 168, `bold 26px ${FONT_DISPLAY}`, PALETTE.teal, 'center');
  if (state.newBest) {
    text(ctx, '★ NEW BEST SCORE ★', 640, card.y + 202, `bold 17px ${FONT_DISPLAY}`,
      PALETTE.gold, 'center');
  }
  let y = card.y + 250;
  for (let i = 0; i < 3; i++) {
    const s = state.sceneResults[i];
    if (!s) continue; // Defensive: a result row is never worth a crash.
    text(ctx, s.name, card.x + 60, y, `16px ${FONT_DISPLAY}`, PALETTE.cream);
    drawStars(ctx, card.x + card.w - 130, y - 6, s.stars, 22);
    y += 40;
  }
  text(ctx, `Best: ${state.best.toLocaleString('en-US')}   ·   ${state.totalFound}/28 differences found`,
    640, card.y + 400, `15px ${FONT_DISPLAY}`, PALETTE.creamDim, 'center');
  const b = bigButton(ctx, 'replay', 'PLAY AGAIN', 490, card.y + 428, 300, 56);
  setButtons([b]);
}

// ---------------------------------------------------------------- main draw

export function drawGame(ctx, state, now) {
  const t = now / 1000;
  const scene = state.scene;
  const [offA, offB] = offscreen();

  ctx.fillStyle = PALETTE.night;
  ctx.fillRect(0, 0, 1280, 720);

  // Panels (with a tiny trauma shake on a wrong click).
  const shake = state.shake * state.shake * 6;
  const sx = shake ? (Math.sin(now / 31) * shake) : 0;
  const sy = shake ? (Math.cos(now / 47) * shake) : 0;
  drawPanel(offA, scene, 0, state, t, now);
  drawPanel(offB, scene, 1, state, t, now);
  const P = LAYOUT.panels;
  ctx.drawImage(offA, P.ax + sx, P.y + sy);
  ctx.drawImage(offB, P.bx + sx, P.y + sy);

  // Panel frames + A/B badges.
  ctx.strokeStyle = 'rgba(255, 246, 229, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(P.ax, P.y, P.size, P.size);
  ctx.strokeRect(P.bx, P.y, P.size, P.size);
  for (const [bx, label] of [[P.ax, 'A'], [P.bx, 'B']]) {
    ctx.fillStyle = PALETTE.nightDeep;
    circle(ctx, bx + 22, P.y + 22, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 2;
    circle(ctx, bx + 22, P.y + 22, 16);
    ctx.stroke();
    text(ctx, label, bx + 22, P.y + 28, `bold 17px ${FONT_DISPLAY}`, PALETTE.gold, 'center');
  }

  drawTopBar(ctx, state, scene, now);
  drawRail(ctx, state, scene);

  // Event strip under the panels: the last three market-wire events,
  // oldest on top, newest (brightest) at the bottom.
  const S = LAYOUT.strip;
  state.events.slice(-3).forEach((ev, i) => {
    const alpha = [0.45, 0.7, 1][i] ?? 1;
    ctx.globalAlpha = alpha;
    text(ctx, `› ${ev}`, S.x, S.y + 18 + i * 16, `13px ${FONT_DISPLAY}`, PALETTE.cream);
    ctx.globalAlpha = 1;
  });

  // Floating score popups and find-burst particles. Each popup rides on a
  // dark pill so the gold numerals read on any background (a jar, the sky).
  for (const f of state.floats) {
    const age = (now - f.birth) / 1000;
    if (age > 1.1) continue;
    const fy = f.y - age * 42;
    const alpha = 1 - age / 1.1;
    ctx.font = `bold 22px ${FONT_DISPLAY}`;
    const w = ctx.measureText(f.text).width + 18;
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = 'rgba(12, 17, 34, 0.85)';
    roundRect(ctx, f.x - w / 2, fy - 22, w, 28, 8);
    ctx.fill();
    ctx.globalAlpha = alpha;
    text(ctx, f.text, f.x, fy, `bold 22px ${FONT_DISPLAY}`, f.color, 'center');
    ctx.globalAlpha = 1;
  }
  for (const p of state.particles) {
    const age = (now - p.birth) / 1000;
    if (age > p.life) continue;
    const k = 1 - age / p.life;
    ctx.globalAlpha = k;
    ctx.fillStyle = p.color;
    circle(ctx, p.x + p.vx * age, p.y + p.vy * age + 30 * age * age, p.size * k + 0.5);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Wrong-click red X at the click point.
  if (state.wrongFlash && now - state.wrongFlash.birth < 500) {
    const age = (now - state.wrongFlash.birth) / 500;
    const { x, y } = state.wrongFlash;
    ctx.globalAlpha = 1 - age;
    ctx.strokeStyle = PALETTE.coral;
    ctx.lineWidth = 5;
    const r = 14 + age * 8;
    ctx.beginPath();
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r);
    ctx.lineTo(x - r, y + r);
    ctx.stroke();
    ctx.globalAlpha = 1;
    text(ctx, '−5s', x, y + 34, `bold 15px ${FONT_DISPLAY}`, PALETTE.coral, 'center');
  }

  // Magnifier lens: a 2x circle following the cursor on the hovered panel.
  if (state.lens && state.hover) {
    const hover = state.hover;
    const off = hover.panel === 'A' ? offA : offB;
    const px = hover.panel === 'A' ? P.ax : P.bx;
    const sxp = px + hover.x;
    const syp = P.y + hover.y;
    const R = 92;
    ctx.save();
    ctx.beginPath();
    ctx.arc(sxp, syp, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, hover.x - R / 2, hover.y - R / 2, R, R, sxp - R, syp - R, R * 2, R * 2);
    ctx.restore();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(sxp, syp, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(12, 17, 34, 0.75)';
    roundRect(ctx, sxp - 46, syp + R - 14, 92, 22, 6);
    ctx.fill();
    text(ctx, '2× lens', sxp, syp + R + 2, `bold 12px ${FONT_DISPLAY}`, PALETTE.cream, 'center');
  }

  // Bottom bar: controls + the depth line.
  const B = LAYOUT.bottomBar;
  ctx.fillStyle = 'rgba(255, 246, 229, 0.06)';
  ctx.fillRect(0, B.y, 1280, B.h);
  text(ctx, 'Click a difference  ·  H hint  ·  ← → ↑ ↓ move crosshair  ·  Enter mark  ·  L lens  ·  P pause  ·  M mute',
    16, B.y + 26, `13px ${FONT_DISPLAY}`, PALETTE.creamDim);
  text(ctx, '3 scenes · 28 differences', 1264, B.y + 26,
    `bold 13px ${FONT_DISPLAY}`, PALETTE.creamDim, 'right');

  // Screen overlays.
  if (state.screen === 'menu') {
    setButtons([]);
    drawMenu(ctx, state);
  } else if (state.screen === 'paused') {
    setButtons([]);
    drawPaused(ctx);
  } else if (state.screen === 'sceneComplete') {
    setButtons([]);
    drawSceneComplete(ctx, state);
  } else if (state.screen === 'final') {
    setButtons([]);
    drawFinal(ctx, state);
  } else if (state.screen === 'playing') {
    // The hint button is live while playing.
    setButtons([{ id: 'hint', ...state.hintButton }]);
  }
}
