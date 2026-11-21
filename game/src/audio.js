// audio.js — WebAudio synth sounds. No audio files, no network: every
// sound is an oscillator envelope built at play time. The context is
// created lazily on the first user gesture (browsers block audio before
// one); screenshot mode never touches it.

let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// A bright two-note chime on a find.
export function playFind() {
  tone(880, 0.16, 'sine', 0.22);
  tone(1318, 0.24, 'sine', 0.18, 0.07);
}

// A low buzz on a wrong click.
export function playWrong() {
  tone(140, 0.22, 'sawtooth', 0.14, 0, 90);
}

// A soft shimmer on a hint.
export function playHint() {
  tone(1046, 0.3, 'triangle', 0.12, 0, 1568);
  tone(1568, 0.3, 'sine', 0.08, 0.08);
}

// A short arpeggio on scene complete.
export function playWin() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => tone(n, 0.22, 'triangle', 0.16, i * 0.09));
}

// A quiet click for the last ten seconds.
export function playTick() {
  tone(1200, 0.05, 'square', 0.05);
}
