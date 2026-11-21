// input.js — mouse + keyboard input for Twilight Market.
// Clicks on either panel mark a spot; arrow keys drive a crosshair so the
// game is fully playable by keyboard alone. L (hold) or right-mouse (hold)
// opens the magnifier lens. All layout math lives in render.js (LAYOUT),
// so this file never hard-codes a pixel of the frame.

import { LAYOUT } from './render.js';

export function attachInput(canvas, api) {
  // Convert a mouse event to canvas coordinates (the canvas may be scaled
  // by CSS, so scale client pixels back to the 1280x720 game space).
  function toCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1280,
      y: ((e.clientY - rect.top) / rect.height) * 720,
    };
  }

  // Which panel, if any, holds this canvas point — and where inside it.
  function panelAt(x, y) {
    if (y < LAYOUT.panels.y || y > LAYOUT.panels.y + LAYOUT.panels.size) return null;
    if (x >= LAYOUT.panels.ax && x <= LAYOUT.panels.ax + LAYOUT.panels.size) {
      return { panel: 'A', x: x - LAYOUT.panels.ax, y: y - LAYOUT.panels.y };
    }
    if (x >= LAYOUT.panels.bx && x <= LAYOUT.panels.bx + LAYOUT.panels.size) {
      return { panel: 'B', x: x - LAYOUT.panels.bx, y: y - LAYOUT.panels.y };
    }
    return null;
  }

  function buttonAt(x, y) {
    // Buttons are registered by the renderer as named rectangles.
    for (const b of api.buttons()) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
    }
    return null;
  }

  canvas.addEventListener('click', (e) => {
    const p = toCanvas(e);
    const button = buttonAt(p.x, p.y);
    if (button) {
      api.onButton(button);
      return;
    }
    const hit = panelAt(p.x, p.y);
    if (hit) api.onMark(hit.x, hit.y, hit.panel);
    else api.onBackgroundClick(p.x, p.y);
  });

  canvas.addEventListener('mousemove', (e) => {
    const p = toCanvas(e);
    const hit = panelAt(p.x, p.y);
    api.onHover(hit ? { panel: hit.panel, x: hit.x, y: hit.y } : null);
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) api.onLens(true);
  });
  window.addEventListener('mouseup', (e) => {
    if (e.button === 2) api.onLens(false);
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight'
      && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const step = e.shiftKey ? 2 : 12;
    switch (e.key) {
      case 'ArrowLeft': api.onCrosshair(-step, 0); e.preventDefault(); break;
      case 'ArrowRight': api.onCrosshair(step, 0); e.preventDefault(); break;
      case 'ArrowUp': api.onCrosshair(0, -step); e.preventDefault(); break;
      case 'ArrowDown': api.onCrosshair(0, step); e.preventDefault(); break;
      case 'Enter':
      case ' ': api.onConfirm(); e.preventDefault(); break;
      case 'h': case 'H': api.onHint(); break;
      case 'm': case 'M': api.onMute(); break;
      case 'p': case 'P':
      case 'Escape': api.onPause(); break;
      case 'l': case 'L': api.onLens(true); break;
      case 'n': case 'N': api.onAdvance(); break;
      default: break;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'l' || e.key === 'L') api.onLens(false);
  });
}
