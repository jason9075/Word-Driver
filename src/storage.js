/**
 * Persistent progress in localStorage: best streak per difficulty and the
 * set of unlocked vehicles. Degrades gracefully when storage is unavailable
 * (private browsing, blocked cookies) — everything just resets per session.
 */

const STORAGE_KEY = 'car-words:v1';
const DEFAULT_UNLOCKED = ['classic'];

/**
 * @typedef {{best: Record<string, number>, unlocked: string[]}} SaveData
 */

/** @returns {SaveData} */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return {
      best: typeof data.best === 'object' && data.best !== null ? data.best : {},
      unlocked: Array.isArray(data.unlocked) ? data.unlocked : [...DEFAULT_UNLOCKED],
    };
  } catch (error) {
    console.warn('Failed to read saved progress:', error);
    return { best: {}, unlocked: [...DEFAULT_UNLOCKED] };
  }
}

/** @param {SaveData} data */
function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save progress:', error);
  }
}

/**
 * Best streak ever reached on a difficulty.
 * @param {string} difficulty
 * @returns {number}
 */
export function getBest(difficulty) {
  return load().best[difficulty] ?? 0;
}

/**
 * Records a finished streak; persists only if it beats the previous best.
 * @param {string} difficulty
 * @param {number} score
 * @returns {boolean} true if this is a new best
 */
export function recordScore(difficulty, score) {
  const data = load();
  if (score <= (data.best[difficulty] ?? 0)) return false;
  data.best[difficulty] = score;
  save(data);
  return true;
}

/**
 * @param {string} vehicleId
 * @returns {boolean} whether the vehicle is unlocked
 */
export function isUnlocked(vehicleId) {
  return load().unlocked.includes(vehicleId);
}

/**
 * Unlocks a vehicle.
 * @param {string} vehicleId
 * @returns {boolean} true if it was newly unlocked
 */
export function unlockVehicle(vehicleId) {
  const data = load();
  if (data.unlocked.includes(vehicleId)) return false;
  data.unlocked.push(vehicleId);
  save(data);
  return true;
}
