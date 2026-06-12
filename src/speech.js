/**
 * Text-to-speech wrapper with cross-browser voice selection.
 *
 * Firefox quirk: getVoices() often returns [] on first call AND voiceschanged
 * may never fire on Linux. We poll up to 3 seconds on first use as a fallback.
 *
 * Voice priority (highest → lowest):
 *   1. Google voices            (Chrome – very natural)
 *   2. Microsoft Neural/Online  (Edge/Windows – very natural)
 *   3. Apple Samantha / Karen   (Safari/macOS/iOS – good)
 *   4. Any non-espeak en-US
 *   5. Any non-espeak en-*
 *   6. Whatever is available
 */

let soundEnabled = true;
/** @type {SpeechSynthesisVoice | null | false} */
// null = not yet resolved, false = no voice available
let cachedVoice = null;
let voiceResolved = false;

/** @returns {SpeechSynthesisVoice | null} */
function pickBestVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const scored = voices.map((v) => {
    let score = 0;
    const name = v.name.toLowerCase();
    if (name.includes('google'))                                  score += 100;
    else if (name.includes('neural') || name.includes('online')) score += 80;
    else if (name.includes('samantha') || name.includes('karen')) score += 70;
    if (v.lang === 'en-US')   score += 20;
    else if (v.lang.startsWith('en')) score += 10;
    // Penalise robotic/legacy engines that Firefox commonly surfaces
    if (name.includes('espeak') || name.includes('festival') ||
        name.includes('mbrola'))                                  score -= 60;
    return { voice: v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  // If the only option is espeak etc., mark as unavailable so we skip TTS
  // and rely purely on the Web Audio sound effects.
  return best.score >= 0 ? best.voice : null;
}

/**
 * Resolves the best voice. Polls on Firefox where voiceschanged may not fire.
 * @returns {Promise<SpeechSynthesisVoice | null>}
 */
function resolveVoice() {
  if (voiceResolved) return Promise.resolve(cachedVoice);

  const immediate = pickBestVoice();
  if (immediate) {
    cachedVoice = immediate;
    voiceResolved = true;
    return Promise.resolve(immediate);
  }

  // Poll every 100 ms for up to 3 s (covers Firefox async voice loading).
  return new Promise((resolve) => {
    let attempts = 0;
    const id = setInterval(() => {
      const voice = pickBestVoice();
      attempts += 1;
      if (voice || attempts >= 30) {
        clearInterval(id);
        cachedVoice = voice;
        voiceResolved = true;
        resolve(voice);
      }
    }, 100);
  });
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = pickBestVoice();
    voiceResolved = true;
  });
}

/** @returns {boolean} */
export function isSoundEnabled() {
  return soundEnabled;
}

/** @param {boolean} enabled */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  if (!enabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speaks the given English text. Silently skips if no acceptable voice is
 * found (e.g. Linux Firefox with only espeak installed).
 * @param {string} text
 * @param {{rate?: number, pitch?: number}} [opts]
 */
export async function speak(text, { rate = 0.88, pitch = 1.1 } = {}) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  try {
    const voice = await resolveVoice();
    // No acceptable voice found — skip TTS, game sound effects still play.
    if (voice === null) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis failed:', err);
  }
}
