/**
 * Tiny wrapper around the Web Speech API so the game can read words aloud.
 * Degrades silently on browsers without speech synthesis.
 */

let soundEnabled = true;

/** @returns {boolean} whether sound is currently enabled */
export function isSoundEnabled() {
  return soundEnabled;
}

/**
 * Enables or disables all speech output.
 * @param {boolean} enabled
 */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  if (!enabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speaks the given English text with a slow, friendly voice.
 * @param {string} text
 */
export function speak(text) {
  if (!soundEnabled || !('speechSynthesis' in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.15;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('Speech synthesis failed:', error);
  }
}
