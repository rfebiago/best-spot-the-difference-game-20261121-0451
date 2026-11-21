// scenes.js — the three Twilight Market scenes.
// Each scene draws BOTH panels with one function: draw(ctx, variant, t).
// variant 0 is the original (panel A), variant 1 is the near-twin (panel B);
// every difference is a conditional branch on `variant`, so the panels are
// near-identical by construction. Difference coordinates are defined once,
// next to the art they describe — never random, always hand-placed.
//
// Panel space is 540 x 540. A difference entry is:
//   { id, name, kind, x, y, r }  — x/y/r in panel coordinates.

import {
  PALETTE, TAU, mulberry32, clamp, circle, roundRect,
  drawLantern, drawCat, drawAwning, drawStallCounter, drawMoon, drawStar,
  drawStringLights, drawFirefly, drawSteamer, drawNoodleBowl, drawRoastDuck,
  drawBoat, drawReflection, drawFish,
} from './art.js';

export const PANEL = 540;

// ---------------------------------------------------------------- helpers

function skyGradient(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 340);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL, 340);
}

function starField(ctx, seed, count, yMax = 200) {
  const rnd = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const x = 12 + rnd() * (PANEL - 24);
    const y = 10 + rnd() * yMax;
    const r = 0.8 + rnd() * 1.4;
    ctx.fillStyle = `rgba(255, 246, 229, ${0.35 + rnd() * 0.55})`;
    circle(ctx, x, y, r);
    ctx.fill();
  }
}

function cobbles(ctx, y0) {
  ctx.fillStyle = '#232c4a';
  ctx.fillRect(0, y0, PANEL, PANEL - y0);
  ctx.strokeStyle = 'rgba(12, 17, 34, 0.8)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 4; row++) {
    const y = y0 + 14 + row * 26;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL, y);
    ctx.stroke();
    for (let col = 0; col < 7; col++) {
      const x = ((row % 2) * 38) + col * 78;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 26);
      ctx.stroke();
    }
  }
}

// Firefly positions for scene 3: computed once from a fixed seed, so the
// drawn fireflies and the difference registry can never drift apart.
function fireflyPositions(seed, count) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({ x: 50 + rnd() * 440, y: 300 + rnd() * 190, phase: rnd() * TAU });
  }
  return out;
}
const FLIES = fireflyPositions(77, 9);

// ================================================================ SCENE 1
// Lantern Row — 7 differences, 150 s, generous targets.

function drawLanternRow(ctx, v, t) {
  skyGradient(ctx, '#141b33', '#2a2f52');
  starField(ctx, 11, 22, 150);
  drawMoon(ctx, 70, 55, 30, v === 1); // diff 6: full -> crescent

  // Shopfronts: three stalls under one long roofline.
  ctx.fillStyle = PALETTE.roof;
  ctx.fillRect(0, 96, PANEL, 14);
  ctx.fillStyle = '#1b2340';
  ctx.fillRect(0, 110, PANEL, 330);
  // Stall walls.
  ctx.fillStyle = '#2c3557';
  ctx.fillRect(20, 130, 160, 300);
  ctx.fillRect(190, 130, 160, 300);
  ctx.fillRect(360, 130, 160, 300);
  // Awnings: middle stall loses a stripe in variant B (diff 4).
  drawAwning(ctx, 20, 130, 160, 26, '#f59e0b', '#fff6e5', 5);
  drawAwning(ctx, 190, 130, 160, 26, '#2dd4bf', '#fff6e5', v === 1 ? 4 : 5);
  drawAwning(ctx, 360, 130, 160, 26, '#e2543e', '#fff6e5', 5);

  // Shop sign on stall 3: a painted lantern in A, a painted bowl in B (diff 5).
  ctx.fillStyle = '#3a2a18';
  roundRect(ctx, 378, 178, 84, 56, 8);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, 378, 178, 84, 56, 8);
  ctx.stroke();
  if (v === 0) {
    drawLantern(ctx, 420, 206, 0.9, '#ffb347', false);
  } else {
    drawNoodleBowl(ctx, 420, 210, 0.85, true);
  }

  // Stall 1 goods: stacked jars on a shelf.
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(36, 382, 128, 8);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 1 ? '#2dd4bf' : '#ffb347';
    roundRect(ctx, 44 + i * 46, 330 - i * 8, 38, 52, 8);
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(52 + i * 46, 322 - i * 8, 22, 8);
  }
  // Stall 2 goods: folded cloth bolts on a shelf.
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(202, 384, 140, 8);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#e2543e', '#2dd4bf', '#ffd166'][i];
    roundRect(ctx, 210 + i * 44, 340, 36, 44, 6);
    ctx.fill();
  }

  // Wall dressing for the two bare upper walls: paper fans on stall 1,
  // a string of dried chillies on stall 2. Identical in both variants.
  for (const [fx, fy, fc] of [[100, 240, '#e2543e'], [142, 218, '#2dd4bf']]) {
    ctx.fillStyle = fc;
    circle(ctx, fx, fy, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 246, 229, 0.6)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI - Math.PI;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(a) * 18, fy + Math.sin(a) * 18);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = 'rgba(216, 205, 180, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(215, 205);
  ctx.quadraticCurveTo(270, 225, 325, 205);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    const cx = (1 - t) * (1 - t) * 215 + 2 * (1 - t) * t * 270 + t * t * 325;
    const cy = (1 - t) * (1 - t) * 205 + 2 * (1 - t) * t * 225 + t * t * 205 + 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.5);
    ctx.fillStyle = '#e2543e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 9, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // The lantern row: five lanterns on a line (diffs 1 and 2).
  ctx.strokeStyle = 'rgba(216, 205, 180, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 92);
  ctx.lineTo(500, 92);
  ctx.stroke();
  const lanternXs = [70, 160, 250, 340, 430];
  for (let i = 0; i < 5; i++) {
    if (v === 1 && i === 2) continue; // diff 1: the middle lantern is gone
    const color = i === 4 ? (v === 1 ? '#2dd4bf' : '#e2543e') : '#ffb347'; // diff 2
    ctx.strokeStyle = 'rgba(216, 205, 180, 0.8)';
    ctx.beginPath();
    ctx.moveTo(lanternXs[i], 92);
    ctx.lineTo(lanternXs[i], 96);
    ctx.stroke();
    const sway = Math.sin(t * 0.8 + i * 1.3) * 1.5;
    drawLantern(ctx, lanternXs[i] + sway, 112, 1, color);
  }

  cobbles(ctx, 430);

  // Crate with a cat (diff 3: the cat is gone in B).
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(34, 402, 56, 28);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(34, 402, 56, 5);
  ctx.strokeStyle = 'rgba(20, 27, 51, 0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 402, 56, 28);
  if (v === 0) drawCat(ctx, 62, 388, 0.9);

  // Fruit basket (diff 7: oranges in A, red apples in B).
  ctx.fillStyle = '#8a6234';
  ctx.beginPath();
  ctx.ellipse(440, 448, 42, 14, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillRect(398, 436, 84, 12);
  for (let i = 0; i < 5; i++) {
    const fx = 412 + i * 15;
    const fy = 432 - (i % 2) * 8;
    ctx.fillStyle = v === 1 ? '#e2543e' : '#f59e0b';
    circle(ctx, fx, fy, 9);
    ctx.fill();
    if (v === 1) {
      ctx.fillStyle = '#7fc97f';
      ctx.beginPath();
      ctx.ellipse(fx + 4, fy - 8, 5, 2.5, -0.5, 0, TAU);
      ctx.fill();
    }
  }
  // A potted plant for balance.
  ctx.fillStyle = '#a1763f';
  ctx.fillRect(492, 396, 26, 34);
  ctx.fillStyle = '#3f7d4e';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(505 + Math.cos(i * 1.26) * 10, 392 - Math.abs(Math.sin(i * 1.26)) * 12,
      6, 12, i * 0.5, 0, TAU);
    ctx.fill();
  }
}

const SCENE1_DIFFS = [
  { id: 's1-lantern-missing', name: 'Missing lantern', kind: 'removed', x: 250, y: 112, r: 20 },
  { id: 's1-lantern-colour', name: 'Lantern colour', kind: 'colour', x: 430, y: 112, r: 20 },
  { id: 's1-cat', name: 'Cat on the crate', kind: 'removed', x: 62, y: 388, r: 22 },
  { id: 's1-awning', name: 'Awning stripes', kind: 'count', x: 270, y: 143, r: 20 },
  { id: 's1-sign', name: 'Shop sign', kind: 'detail', x: 420, y: 206, r: 20 },
  { id: 's1-moon', name: 'Moon phase', kind: 'shape', x: 70, y: 55, r: 26 },
  { id: 's1-fruit', name: 'Fruit swap', kind: 'colour', x: 440, y: 432, r: 22 },
];

// ================================================================ SCENE 2
// The Noodle Stall — 9 differences, 150 s, busier, smaller targets.

function drawNoodleStall(ctx, v, t) {
  skyGradient(ctx, '#141b33', '#33263f');
  starField(ctx, 23, 16, 90);

  // Back wall and floor.
  ctx.fillStyle = '#241d33';
  ctx.fillRect(0, 100, PANEL, 300);
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(0, 400, PANEL, 140);
  ctx.fillStyle = 'rgba(255, 246, 229, 0.06)';
  for (let i = 0; i < 6; i++) ctx.fillRect(0, 420 + i * 20, PANEL, 2);

  // String lights (diff 7: bulb 5 is dark in B — 7 lit, not 8).
  drawStringLights(ctx, 20, 36, 520, 36, 8, 8, 18, v === 1 ? 5 : -1);

  // Menu board, left wall (diff 6: the price digit changes).
  ctx.fillStyle = '#3a2a18';
  roundRect(ctx, 24, 110, 126, 92, 8);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, 24, 110, 126, 92, 8);
  ctx.stroke();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 15px Trebuchet MS, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MENU', 87, 132);
  ctx.font = '13px Trebuchet MS, system-ui, sans-serif';
  ctx.fillText('NOODLE', 62, 158);
  ctx.fillText(v === 1 ? '15' : '12', 128, 158);
  ctx.fillText('DUMPLING  9', 87, 180);

  // Hanging roast duck (diff 4: gone in B).
  if (v === 0) drawRoastDuck(ctx, 480, 140, 1);

  // Window with shutter, right wall (diff 9: open in A, closed in B).
  ctx.fillStyle = '#0c1122';
  ctx.fillRect(424, 238, 92, 88);
  ctx.strokeStyle = PALETTE.wood;
  ctx.lineWidth = 5;
  ctx.strokeRect(424, 238, 92, 88);
  if (v === 0) {
    // Open: slats apart, night showing through.
    ctx.fillStyle = '#2dd4bf';
    for (let i = 0; i < 4; i++) ctx.fillRect(430, 246 + i * 20, 80, 5);
    drawStar(ctx, 448, 268, 7, '#fff6e5');
    drawStar(ctx, 492, 300, 5, '#fff6e5');
  } else {
    // Closed: solid shutter panel.
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(424, 238, 92, 88);
    ctx.fillStyle = 'rgba(20, 27, 51, 0.4)';
    for (let i = 0; i < 4; i++) ctx.fillRect(424, 256 + i * 20, 92, 4);
  }

  // Vendor behind the counter (diff 5: hat amber in A, teal in B).
  const vx = 270;
  ctx.fillStyle = '#e2543e';
  ctx.fillRect(vx - 52, 330, 104, 62); // torso down behind the counter
  ctx.beginPath();
  ctx.ellipse(vx, 330, 52, 62, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#f2c89b';
  circle(ctx, vx, 268, 26);
  ctx.fill();
  ctx.fillStyle = '#141b33';
  circle(ctx, vx - 9, 266, 2.4);
  ctx.fill();
  circle(ctx, vx + 9, 266, 2.4);
  ctx.fill();
  ctx.strokeStyle = '#141b33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(vx, 276, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = v === 1 ? '#2dd4bf' : '#f59e0b'; // the hat
  ctx.beginPath();
  ctx.ellipse(vx, 246, 34, 12, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(vx, 244, 20, 16, 0, Math.PI, 0);
  ctx.fill();

  // Counter with bowls.
  drawStallCounter(ctx, 30, 392, 480, 76);
  drawSteamer(ctx, 110, 388, 1, v === 1 ? 2 : 3, t); // diff 1: tiers 3 -> 2
  drawNoodleBowl(ctx, 300, 424, 1, v !== 1); // diff 3: full -> empty
  // Chopsticks on the second bowl (diff 2: pointing left in A, right in B).
  ctx.strokeStyle = '#8a6234';
  ctx.lineWidth = 3;
  const chopDir = v === 1 ? 1 : -1;
  ctx.beginPath();
  ctx.moveTo(390 - chopDir * 16, 402);
  ctx.lineTo(390 + chopDir * 16, 424);
  ctx.moveTo(390 - chopDir * 14, 398);
  ctx.lineTo(390 + chopDir * 18, 420);
  ctx.stroke();
  ctx.fillStyle = '#2d5a8a';
  ctx.beginPath();
  ctx.ellipse(390, 424, 30, 12, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#3a6ea5';
  ctx.fillRect(360, 410, 60, 14);
  // A jar of chilli oil and a teapot for clutter.
  ctx.fillStyle = '#e2543e';
  roundRect(ctx, 448, 372, 26, 30, 5);
  ctx.fill();
  ctx.fillStyle = '#2dd4bf';
  circle(ctx, 500, 388, 12);
  ctx.fill();

  // Stool with a cat (diff 8: the cat is gone in B).
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(52, 496, 40, 8);
  ctx.fillRect(58, 504, 6, 26);
  ctx.fillRect(80, 504, 6, 26);
  if (v === 0) drawCat(ctx, 72, 482, 0.85);
}

const SCENE2_DIFFS = [
  { id: 's2-steamer', name: 'Steamer tiers', kind: 'count', x: 110, y: 356, r: 20 },
  { id: 's2-chopsticks', name: 'Chopsticks', kind: 'flipped', x: 390, y: 412, r: 16 },
  { id: 's2-bowl', name: 'Empty bowl', kind: 'removed-content', x: 300, y: 420, r: 20 },
  { id: 's2-duck', name: 'Roast duck', kind: 'removed', x: 480, y: 140, r: 20 },
  { id: 's2-hat', name: 'Vendor hat', kind: 'colour', x: 270, y: 242, r: 20 },
  { id: 's2-price', name: 'Menu price', kind: 'detail', x: 128, y: 156, r: 16 },
  { id: 's2-bulbs', name: 'Light bulb', kind: 'count', x: 364, y: 58, r: 16 },
  { id: 's2-cat', name: 'Cat on the stool', kind: 'removed', x: 72, y: 482, r: 20 },
  { id: 's2-shutter', name: 'Window shutter', kind: 'state', x: 470, y: 282, r: 24 },
];

// ================================================================ SCENE 3
// Firefly Canal — 12 differences, 180 s, count + tiny-detail kinds.

function drawFireflyCanal(ctx, v, t) {
  skyGradient(ctx, '#0c1122', '#1b2340');
  starField(ctx, 37, 26, 130);
  drawMoon(ctx, 70, 60, 28, false, v === 1); // diff 12: crater appears in B

  // Constellation top-right (diff 9: one star missing in B).
  const constellation = [[430, 42], [458, 58], [486, 46], [470, 84], [440, 96]];
  ctx.strokeStyle = 'rgba(255, 246, 229, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(constellation[0][0], constellation[0][1]);
  for (let i = 1; i < constellation.length; i++) ctx.lineTo(constellation[i][0], constellation[i][1]);
  ctx.stroke();
  for (let i = 0; i < constellation.length; i++) {
    if (v === 1 && i === 2) continue; // the missing star
    drawStar(ctx, constellation[i][0], constellation[i][1], i === 2 ? 6 : 4.5);
  }

  // Houses along the far bank.
  const houses = [
    { x: 40, w: 110, h: 110, lit: true },
    { x: 170, w: 130, h: 130, lit: true },
    { x: 330, w: 150, h: 100, lit: true },
  ];
  for (const h of houses) {
    ctx.fillStyle = '#27355c';
    ctx.fillRect(h.x, 260 - h.h, h.w, h.h);
    ctx.fillStyle = '#1b2340';
    ctx.beginPath();
    ctx.moveTo(h.x - 6, 260 - h.h);
    ctx.lineTo(h.x + h.w / 2, 260 - h.h - 34);
    ctx.lineTo(h.x + h.w + 6, 260 - h.h);
    ctx.closePath();
    ctx.fill();
  }
  // Windows: the first house's window goes dark in B (diff 6).
  const windows = [
    { x: 82, y: 196, w: 26, h: 30, lit: v !== 1 },
    { x: 210, y: 180, w: 26, h: 30, lit: true },
    { x: 258, y: 180, w: 26, h: 30, lit: true },
    { x: 380, y: 200, w: 26, h: 30, lit: true },
    { x: 428, y: 200, w: 26, h: 30, lit: true },
  ];
  for (const w of windows) {
    ctx.fillStyle = w.lit ? '#ffd166' : '#0c1122';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = '#141b33';
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x, w.y, w.w, w.h);
    ctx.beginPath();
    ctx.moveTo(w.x + w.w / 2, w.y);
    ctx.lineTo(w.x + w.w / 2, w.y + w.h);
    ctx.stroke();
  }

  // The bridge: an arch over the canal.
  ctx.fillStyle = '#2c3557';
  ctx.beginPath();
  ctx.moveTo(120, 300);
  ctx.quadraticCurveTo(270, 180, 420, 300);
  ctx.lineTo(420, 316);
  ctx.quadraticCurveTo(270, 212, 120, 316);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a466e';
  ctx.fillRect(120, 296, 300, 10);
  // Deck planks + a handrail, so the bridge reads as a bridge.
  ctx.strokeStyle = 'rgba(20, 27, 51, 0.5)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const px = 140 + i * 90;
    ctx.beginPath();
    ctx.moveTo(px, 297);
    ctx.lineTo(px, 305);
    ctx.stroke();
  }
  ctx.strokeStyle = '#3a466e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(130, 282);
  ctx.lineTo(410, 282);
  ctx.stroke();
  ctx.fillStyle = '#3a466e';
  for (const px of [150, 190, 230, 270, 350, 390]) {
    ctx.fillRect(px - 2, 282, 4, 14);
  }
  // Bridge steps, right side (diff 8: 5 steps in A, 4 in B).
  const steps = v === 1 ? 4 : 5;
  ctx.fillStyle = '#2c3557';
  for (let i = 0; i < steps; i++) {
    ctx.fillRect(420 + i * 12, 306 - i * 12, 14, 12);
  }
  // Arch light under the bridge (diff 2: amber in A, teal in B).
  drawLantern(ctx, 270, 232, 0.8, v === 1 ? '#2dd4bf' : '#ffb347');
  // Flag on the bridge (diff 7: blows left in A, right in B).
  ctx.strokeStyle = '#d8cdb4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(330, 296);
  ctx.lineTo(330, 236);
  ctx.stroke();
  ctx.fillStyle = '#e2543e';
  ctx.beginPath();
  ctx.moveTo(330, 236);
  if (v === 0) {
    ctx.lineTo(306, 242);
    ctx.lineTo(330, 248);
  } else {
    ctx.lineTo(354, 242);
    ctx.lineTo(330, 248);
  }
  ctx.closePath();
  ctx.fill();
  // Cat on the bridge (diff 11: gone in B).
  if (v === 0) drawCat(ctx, 300, 288, 0.7);

  // The canal.
  const wg = ctx.createLinearGradient(0, 310, 0, PANEL);
  wg.addColorStop(0, '#16324a');
  wg.addColorStop(1, '#0c1a2e');
  ctx.fillStyle = wg;
  ctx.fillRect(0, 310, PANEL, PANEL - 310);
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const wy = 330 + i * 40;
    ctx.beginPath();
    for (let x = 0; x <= PANEL; x += 18) {
      const yy = wy + Math.sin(x * 0.03 + t * 0.9 + i * 1.4) * 3;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  // Boat 1 with lanterns (diff 1: 4 lanterns in A, 3 in B) and reflection (diff 4).
  drawBoat(ctx, 150, 420, 1, '#ffb347', v === 1 ? 3 : 4, null);
  if (v === 0) drawReflection(ctx, 150, 452, 56, t);
  // Boat 2 with a flag (diff 10: amber in A, coral in B).
  drawBoat(ctx, 380, 452, 0.85, '#ffb347', 1, v === 1 ? '#ff6b6b' : '#ffb347');
  drawReflection(ctx, 380, 484, 48, t);
  // Jumping fish (diff 5: gone in B).
  if (v === 0) drawFish(ctx, 420, 415, 1);

  // Fireflies (diff 3: 9 in A, 7 in B).
  const count = v === 1 ? 7 : 9;
  for (let i = 0; i < count; i++) {
    drawFirefly(ctx, FLIES[i].x, FLIES[i].y, FLIES[i].phase, t);
  }
}

const SCENE3_DIFFS = [
  { id: 's3-boat-lanterns', name: 'Boat lanterns', kind: 'count', x: 180, y: 408, r: 20 },
  { id: 's3-arch-light', name: 'Arch light', kind: 'colour', x: 270, y: 232, r: 16 },
  { id: 's3-firefly', name: 'Missing firefly', kind: 'count', x: FLIES[7].x, y: FLIES[7].y, r: 13 },
  { id: 's3-reflection', name: 'Boat reflection', kind: 'removed', x: 150, y: 468, r: 20 },
  { id: 's3-fish', name: 'Jumping fish', kind: 'removed', x: 420, y: 415, r: 16 },
  { id: 's3-window', name: 'Dark window', kind: 'state', x: 95, y: 211, r: 18 },
  { id: 's3-flag', name: 'Flag direction', kind: 'flipped', x: 330, y: 242, r: 16 },
  { id: 's3-steps', name: 'Bridge steps', kind: 'count', x: 475, y: 264, r: 18 },
  { id: 's3-star', name: 'Missing star', kind: 'detail', x: 486, y: 46, r: 14 },
  { id: 's3-boat-flag', name: 'Boat flag', kind: 'colour', x: 372, y: 424, r: 16 },
  { id: 's3-cat', name: 'Bridge cat', kind: 'removed', x: 300, y: 288, r: 18 },
  { id: 's3-crater', name: 'Moon crater', kind: 'detail', x: 70, y: 60, r: 24 },
];

// ---------------------------------------------------------------- registry

export const SCENES = [
  {
    id: 'lantern-row', name: 'Lantern Row', sub: 'Seven lanterns hide their secrets',
    timer: 150, diffs: SCENE1_DIFFS, draw: drawLanternRow,
  },
  {
    id: 'noodle-stall', name: 'The Noodle Stall', sub: 'Steam, ducks and one wrong price',
    timer: 150, diffs: SCENE2_DIFFS, draw: drawNoodleStall,
  },
  {
    id: 'firefly-canal', name: 'Firefly Canal', sub: 'Twelve tiny lies on the water',
    timer: 180, diffs: SCENE3_DIFFS, draw: drawFireflyCanal,
  },
];

export function sceneById(id) {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
