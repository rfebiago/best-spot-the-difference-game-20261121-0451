// art.js — shared procedural drawing helpers for Twilight Market.
// Every picture in the game is drawn with these Canvas 2D helpers: no image
// assets, no network, nothing borrowed. Colours come from the one palette.

// The night-market palette (one world, both panels, all three scenes).
export const PALETTE = {
  night: '#141b33',
  nightDeep: '#0c1122',
  nightMid: '#1b2340',
  amber: '#ffb347',
  amberDeep: '#f59e0b',
  teal: '#2dd4bf',
  tealDim: '#1d9e8c',
  gold: '#ffd166',
  coral: '#ff6b6b',
  cream: '#fff6e5',
  creamDim: '#d8cdb4',
  wood: '#6b4a2f',
  woodDark: '#4a3220',
  roof: '#27355c',
  paper: '#ffe9b8',
};

export const TAU = Math.PI * 2;

// Deterministic pseudo-random: same seed, same picture, every frame.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// A paper lantern: glowing body with ribs, caps and a tassel.
export function drawLantern(ctx, x, y, s, color, glow = true) {
  const w = 15 * s;
  const h = 19 * s;
  if (glow) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 34 * s);
    g.addColorStop(0, 'rgba(255, 179, 71, 0.45)');
    g.addColorStop(1, 'rgba(255, 179, 71, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 36 * s, y - 36 * s, 72 * s, 72 * s);
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 27, 51, 0.55)';
  ctx.lineWidth = 1.4 * s;
  for (const dx of [-0.55, 0, 0.55]) {
    ctx.beginPath();
    ctx.ellipse(x, y, w * Math.abs(dx) + 1.5 * s, h, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(x - 6 * s, y - h - 2 * s, 12 * s, 4 * s);
  ctx.fillRect(x - 6 * s, y + h - 2 * s, 12 * s, 4 * s);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.moveTo(x, y + h + 2 * s);
  ctx.lineTo(x, y + h + 12 * s);
  ctx.stroke();
}

// A sitting cat, drawn as one dark silhouette with a pale belly patch.
export function drawCat(ctx, x, y, s, color = '#20263f', belly = '#fff6e5') {
  ctx.fillStyle = color;
  ctx.beginPath(); // body
  ctx.ellipse(x, y, 13 * s, 16 * s, 0, 0, TAU);
  ctx.fill();
  circle(ctx, x, y - 20 * s, 10 * s); // head
  ctx.fill();
  ctx.beginPath(); // ears
  ctx.moveTo(x - 9 * s, y - 26 * s);
  ctx.lineTo(x - 11 * s, y - 36 * s);
  ctx.lineTo(x - 2 * s, y - 28 * s);
  ctx.moveTo(x + 9 * s, y - 26 * s);
  ctx.lineTo(x + 11 * s, y - 36 * s);
  ctx.lineTo(x + 2 * s, y - 28 * s);
  ctx.fill();
  ctx.beginPath(); // tail curling up
  ctx.moveTo(x + 11 * s, y + 12 * s);
  ctx.quadraticCurveTo(x + 26 * s, y + 6 * s, x + 22 * s, y - 10 * s);
  ctx.quadraticCurveTo(x + 20 * s, y - 2 * s, x + 12 * s, y + 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = belly; // chest patch
  ctx.beginPath();
  ctx.ellipse(x - 2 * s, y + 2 * s, 5 * s, 9 * s, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffd166'; // eyes
  circle(ctx, x - 4 * s, y - 21 * s, 1.4 * s);
  ctx.fill();
  circle(ctx, x + 4 * s, y - 21 * s, 1.4 * s);
  ctx.fill();
}

// A striped market awning. `stripes` is the count of light stripes.
export function drawAwning(ctx, x, y, w, h, c1, c2, stripes) {
  const seg = w / (stripes * 2);
  for (let i = 0; i < stripes * 2; i++) {
    ctx.fillStyle = i % 2 === 0 ? c1 : c2;
    ctx.fillRect(x + i * seg, y, seg + 0.5, h);
  }
  ctx.fillStyle = 'rgba(20, 27, 51, 0.35)';
  ctx.fillRect(x, y + h - 4, w, 4);
  // Scalloped hem.
  ctx.fillStyle = c2;
  for (let i = 0; i < stripes * 2; i++) {
    circle(ctx, x + i * seg + seg / 2, y + h + 2, seg / 2);
    ctx.fill();
  }
}

// A wooden stall counter with a top plank and posts.
export function drawStallCounter(ctx, x, y, w, h) {
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = PALETTE.wood;
  ctx.fillRect(x - 6, y - 8, w + 12, 12);
  ctx.fillStyle = 'rgba(255, 246, 229, 0.14)';
  ctx.fillRect(x + 8, y + 8, w - 16, 3);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(x + 10, y + h - 4, 8, 10);
  ctx.fillRect(x + w - 18, y + h - 4, 8, 10);
}

// The moon: full disc, or a crescent when `crescent` is true.
export function drawMoon(ctx, x, y, r, crescent, crater = false) {
  ctx.fillStyle = '#ffedb8';
  circle(ctx, x, y, r);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 179, 71, 0.25)';
  circle(ctx, x, y, r + 6);
  ctx.fill();
  ctx.fillStyle = '#ffedb8';
  circle(ctx, x, y, r);
  ctx.fill();
  if (crater) {
    ctx.fillStyle = 'rgba(180, 150, 90, 0.55)';
    circle(ctx, x - r * 0.3, y + r * 0.2, r * 0.22);
    ctx.fill();
    circle(ctx, x + r * 0.35, y - r * 0.3, r * 0.14);
    ctx.fill();
  }
  if (crescent) {
    ctx.fillStyle = PALETTE.night;
    circle(ctx, x + r * 0.55, y - r * 0.2, r * 0.92);
    ctx.fill();
  }
}

// A small five-point star.
export function drawStar(ctx, x, y, r, color = '#fff6e5') {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i / 10) * TAU - Math.PI / 2;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

// A string of glowing bulbs between two points. `lit` bulbs are on; the bulb
// at index `skip` (when >= 0) is drawn dark — one bulb out, the rest lit.
export function drawStringLights(ctx, x0, y0, x1, y1, bulbs, lit, sag = 26, skip = -1) {
  ctx.strokeStyle = 'rgba(216, 205, 180, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1);
  ctx.stroke();
  for (let i = 0; i < bulbs; i++) {
    const t = (i + 0.5) / bulbs;
    const bx = lerp(x0, x1, t);
    const by = lerp(y0, y1, t) + sag * 4 * t * (1 - t);
    const on = i < lit && i !== skip;
    ctx.fillStyle = on ? '#ffd166' : 'rgba(216, 205, 180, 0.35)';
    if (on) {
      const g = ctx.createRadialGradient(bx, by + 6, 1, bx, by + 6, 12);
      g.addColorStop(0, 'rgba(255, 209, 102, 0.6)');
      g.addColorStop(1, 'rgba(255, 209, 102, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - 13, by - 7, 26, 26);
      ctx.fillStyle = '#ffd166';
    }
    ctx.beginPath();
    ctx.arc(bx, by + 7, 4, 0, TAU);
    ctx.fill();
  }
}

// A firefly: a soft glowing dot whose brightness breathes with time.
export function drawFirefly(ctx, x, y, phase, t, s = 1) {
  const glow = 0.45 + 0.55 * Math.sin(t * 1.6 + phase);
  const g = ctx.createRadialGradient(x, y, 0.5, x, y, 9 * s);
  g.addColorStop(0, `rgba(255, 240, 150, ${0.85 * glow})`);
  g.addColorStop(1, 'rgba(255, 240, 150, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 10 * s, y - 10 * s, 20 * s, 20 * s);
  ctx.fillStyle = `rgba(255, 244, 170, ${0.95 * glow})`;
  circle(ctx, x, y, 2.2 * s);
  ctx.fill();
}

// A steamer basket stack: `tiers` round baskets with lids and steam.
export function drawSteamer(ctx, x, y, s, tiers, t) {
  for (let i = 0; i < tiers; i++) {
    const by = y - i * 16 * s;
    ctx.fillStyle = i % 2 === 0 ? '#b98a4e' : '#a1763f';
    roundRect(ctx, x - 26 * s, by - 12 * s, 52 * s, 14 * s, 5 * s);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 246, 229, 0.25)';
    ctx.fillRect(x - 26 * s, by - 12 * s, 52 * s, 3 * s);
  }
  ctx.fillStyle = '#8a6234';
  ctx.beginPath();
  ctx.ellipse(x, y - tiers * 16 * s - 10 * s, 24 * s, 7 * s, 0, Math.PI, 0);
  ctx.fill();
  // Steam wisps, drifting with time.
  ctx.strokeStyle = 'rgba(255, 246, 229, 0.5)';
  ctx.lineWidth = 2 * s;
  for (let i = 0; i < 3; i++) {
    const sx = x - 12 * s + i * 12 * s;
    const sway = Math.sin(t * 1.2 + i * 2.1) * 4 * s;
    const top = y - tiers * 16 * s - 34 * s - ((t * 14 + i * 17) % 22) * s;
    ctx.beginPath();
    ctx.moveTo(sx, y - tiers * 16 * s - 14 * s);
    ctx.quadraticCurveTo(sx + sway, top + 12 * s, sx - sway, top);
    ctx.stroke();
  }
}

// A noodle bowl, full of noodles or empty.
export function drawNoodleBowl(ctx, x, y, s, full) {
  ctx.fillStyle = '#2d5a8a';
  ctx.beginPath();
  ctx.ellipse(x, y, 30 * s, 12 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#3a6ea5';
  ctx.fillRect(x - 30 * s, y - 14 * s, 60 * s, 14 * s);
  ctx.beginPath();
  ctx.ellipse(x, y - 14 * s, 30 * s, 8 * s, 0, 0, TAU);
  ctx.fill();
  if (full) {
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2.4 * s;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x - 14 * s + i * 9 * s, y - 15 * s, 6 * s, Math.PI * 0.9, Math.PI * 2.1);
      ctx.stroke();
    }
    ctx.fillStyle = '#7fc97f';
    circle(ctx, x + 14 * s, y - 18 * s, 3.4 * s);
    ctx.fill();
  } else {
    ctx.fillStyle = '#1d3a5c';
    ctx.beginPath();
    ctx.ellipse(x, y - 14 * s, 26 * s, 6 * s, 0, 0, TAU);
    ctx.fill();
  }
}

// A hanging roast duck: dark body, head, beak, string.
export function drawRoastDuck(ctx, x, y, s) {
  ctx.strokeStyle = 'rgba(216, 205, 180, 0.8)';
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.moveTo(x, y - 34 * s);
  ctx.lineTo(x, y - 12 * s);
  ctx.stroke();
  ctx.fillStyle = '#7a3b1e';
  ctx.beginPath();
  ctx.ellipse(x, y + 6 * s, 11 * s, 18 * s, 0, 0, TAU);
  ctx.fill();
  circle(ctx, x, y - 14 * s, 7 * s);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x + 5 * s, y - 15 * s);
  ctx.lineTo(x + 13 * s, y - 12 * s);
  ctx.lineTo(x + 5 * s, y - 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 209, 102, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x, y + 6 * s, 6 * s, 12 * s, 0, 0, TAU);
  ctx.fill();
}

// A small wooden boat with a lantern pole.
export function drawBoat(ctx, x, y, s, lanternColor = '#ffb347', lanterns = 1, flagColor = null) {
  ctx.fillStyle = '#5a3a22';
  ctx.beginPath();
  ctx.moveTo(x - 34 * s, y);
  ctx.lineTo(x + 34 * s, y);
  ctx.lineTo(x + 24 * s, y + 10 * s);
  ctx.lineTo(x - 24 * s, y + 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(x - 30 * s, y - 2 * s, 60 * s, 4 * s);
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(x - 18 * s, y - 2 * s);
  ctx.lineTo(x - 18 * s, y - 30 * s);
  ctx.stroke();
  if (flagColor) {
    ctx.fillStyle = flagColor;
    ctx.beginPath();
    ctx.moveTo(x - 18 * s, y - 30 * s);
    ctx.lineTo(x - 2 * s, y - 26 * s);
    ctx.lineTo(x - 18 * s, y - 21 * s);
    ctx.closePath();
    ctx.fill();
  }
  // Lanterns sit at fixed offsets; `lanterns` draws the first N, so a
  // missing lantern leaves the others exactly where they were.
  for (let i = 0; i < lanterns; i++) {
    drawLantern(ctx, x + (i * 20 - 30) * s, y - 12 * s, 0.55 * s, lanternColor, false);
  }
}

// A wavy canal reflection under a boat.
export function drawReflection(ctx, x, y, w, t) {
  ctx.strokeStyle = 'rgba(255, 179, 71, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ry = y + i * 7;
    const sway = Math.sin(t * 1.1 + i * 1.7) * 5;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + sway, ry);
    ctx.quadraticCurveTo(x, ry + 3, x + w / 2 - sway, ry);
    ctx.stroke();
  }
}

// A jumping fish arcing out of the water.
export function drawFish(ctx, x, y, s) {
  ctx.fillStyle = '#9fd8e8';
  ctx.beginPath();
  ctx.ellipse(x, y, 12 * s, 5 * s, -0.5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 10 * s, y - 2 * s);
  ctx.lineTo(x - 18 * s, y - 8 * s);
  ctx.lineTo(x - 18 * s, y + 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#141b33';
  circle(ctx, x + 6 * s, y - 2 * s, 1.4 * s);
  ctx.fill();
  ctx.strokeStyle = 'rgba(159, 216, 232, 0.6)';
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.arc(x - 4 * s, y + 10 * s, 8 * s, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
}
