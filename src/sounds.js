/**
 * Game sound effects synthesised with the Web Audio API — no audio files
 * needed. All sounds degrade silently when the API is unavailable.
 *
 * Correct answer : cheerful ascending arpeggio (C–E–G–C)
 * Wrong answer   : two-tone "wah-wah" descending blurt
 * Win fanfare    : short 4-note victory jingle
 * Engine hum     : low continuous rumble that pitches up with speed
 */

/** @type {AudioContext | null} */
let ctx = null;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  // Resume after a user gesture if the browser auto-suspended it.
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/**
 * Plays a single sine/triangle note.
 * @param {AudioContext} ac
 * @param {number} freq   Hz
 * @param {number} start  seconds from now
 * @param {number} dur    seconds
 * @param {number} gain   0–1
 * @param {'sine'|'triangle'|'square'|'sawtooth'} [type]
 */
function note(ac, freq, start, dur, gain = 0.35, type = 'sine') {
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.connect(env);
  env.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  env.gain.setValueAtTime(0, ac.currentTime + start);
  env.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  env.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.05);
}

/** Cheerful C–E–G–C arpeggio for a correct answer. */
export function playCorrect() {
  const ac = getCtx();
  if (!ac) return;
  const freqs = [523, 659, 784, 1047]; // C5 E5 G5 C6
  freqs.forEach((f, i) => note(ac, f, i * 0.1, 0.22, 0.3));
}

/** Descending wah-wah for a wrong answer. */
export function playWrong() {
  const ac = getCtx();
  if (!ac) return;
  // two descending blurts
  [[320, 220], [260, 180]].forEach(([start, end], i) => {
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.connect(env);
    env.connect(ac.destination);
    osc.type = 'sawtooth';
    const t = ac.currentTime + i * 0.22;
    osc.frequency.setValueAtTime(start, t);
    osc.frequency.linearRampToValueAtTime(end, t + 0.18);
    env.gain.setValueAtTime(0.28, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

/** Short 4-note victory fanfare. */
export function playWin() {
  const ac = getCtx();
  if (!ac) return;
  const melody = [
    [523, 0, 0.15],
    [659, 0.15, 0.15],
    [784, 0.3, 0.15],
    [1047, 0.45, 0.45],
  ];
  for (const [f, s, d] of melody) note(ac, f, s, d, 0.32, 'triangle');
}

/** Engine hum — returns a stop function. Updates pitch via `setSpeed(0‒1)`. */
export function startEngine() {
  const ac = getCtx();
  if (!ac) return { setSpeed: () => {}, stop: () => {} };

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(48, ac.currentTime);
  gain.gain.setValueAtTime(0.06, ac.currentTime);
  osc.start();

  return {
    /** @param {number} speed 0–1 normalised */
    setSpeed(speed) {
      if (!ac) return;
      osc.frequency.setTargetAtTime(48 + speed * 60, ac.currentTime, 0.1);
      gain.gain.setTargetAtTime(speed > 0.05 ? 0.06 : 0, ac.currentTime, 0.15);
    },
    stop() {
      gain.gain.setTargetAtTime(0, ac.currentTime, 0.1);
      setTimeout(() => { try { osc.stop(); } catch {} }, 400);
    },
  };
}
