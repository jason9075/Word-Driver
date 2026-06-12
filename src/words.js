/**
 * Word bank for the emoji vocabulary quiz, ordered by difficulty tier:
 * entries 1–10 are the easiest everyday words (Easy), 1–25 form Medium,
 * and the full 100 form Hard. Difficulty pools are prefixes of this list.
 * @typedef {{emoji: string, word: string}} WordEntry
 */

/** @type {readonly WordEntry[]} */
export const WORDS = Object.freeze([
  // ── Easy tier (1–10): short everyday words ──
  { emoji: '🐶', word: 'Dog' },
  { emoji: '🐱', word: 'Cat' },
  { emoji: '🌞', word: 'Sun' },
  { emoji: '🚗', word: 'Car' },
  { emoji: '⚽', word: 'Ball' },
  { emoji: '🍎', word: 'Apple' },
  { emoji: '🐟', word: 'Fish' },
  { emoji: '⭐', word: 'Star' },
  { emoji: '🌳', word: 'Tree' },
  { emoji: '🥚', word: 'Egg' },
  // ── Medium tier (11–25) ──
  { emoji: '🌙', word: 'Moon' },
  { emoji: '🚌', word: 'Bus' },
  { emoji: '🦆', word: 'Duck' },
  { emoji: '🐦', word: 'Bird' },
  { emoji: '🥛', word: 'Milk' },
  { emoji: '🐻', word: 'Bear' },
  { emoji: '🐷', word: 'Pig' },
  { emoji: '🐮', word: 'Cow' },
  { emoji: '🍌', word: 'Banana' },
  { emoji: '👟', word: 'Shoe' },
  { emoji: '🏠', word: 'House' },
  { emoji: '🐸', word: 'Frog' },
  { emoji: '🐝', word: 'Bee' },
  { emoji: '📖', word: 'Book' },
  { emoji: '🍰', word: 'Cake' },
  // ── Hard tier (26–100) ──
  { emoji: '🦁', word: 'Lion' },
  { emoji: '🐯', word: 'Tiger' },
  { emoji: '🐵', word: 'Monkey' },
  { emoji: '🐰', word: 'Rabbit' },
  { emoji: '🐘', word: 'Elephant' },
  { emoji: '🐴', word: 'Horse' },
  { emoji: '🐑', word: 'Sheep' },
  { emoji: '🐐', word: 'Goat' },
  { emoji: '🐔', word: 'Chicken' },
  { emoji: '🐧', word: 'Penguin' },
  { emoji: '🦉', word: 'Owl' },
  { emoji: '🦊', word: 'Fox' },
  { emoji: '🐺', word: 'Wolf' },
  { emoji: '🐼', word: 'Panda' },
  { emoji: '🐨', word: 'Koala' },
  { emoji: '🐍', word: 'Snake' },
  { emoji: '🐢', word: 'Turtle' },
  { emoji: '🐳', word: 'Whale' },
  { emoji: '🐬', word: 'Dolphin' },
  { emoji: '🦈', word: 'Shark' },
  { emoji: '🐙', word: 'Octopus' },
  { emoji: '🦀', word: 'Crab' },
  { emoji: '🐌', word: 'Snail' },
  { emoji: '🐜', word: 'Ant' },
  { emoji: '🦋', word: 'Butterfly' },
  { emoji: '🕷️', word: 'Spider' },
  { emoji: '🐭', word: 'Mouse' },
  { emoji: '🦌', word: 'Deer' },
  { emoji: '🦓', word: 'Zebra' },
  { emoji: '🦒', word: 'Giraffe' },
  { emoji: '🐫', word: 'Camel' },
  { emoji: '🦘', word: 'Kangaroo' },
  { emoji: '🍇', word: 'Grapes' },
  { emoji: '🍓', word: 'Strawberry' },
  { emoji: '🍊', word: 'Orange' },
  { emoji: '🍋', word: 'Lemon' },
  { emoji: '🍉', word: 'Watermelon' },
  { emoji: '🍑', word: 'Peach' },
  { emoji: '🍒', word: 'Cherry' },
  { emoji: '🍍', word: 'Pineapple' },
  { emoji: '🌽', word: 'Corn' },
  { emoji: '🥕', word: 'Carrot' },
  { emoji: '🍅', word: 'Tomato' },
  { emoji: '🍄', word: 'Mushroom' },
  { emoji: '🍞', word: 'Bread' },
  { emoji: '🧀', word: 'Cheese' },
  { emoji: '🍕', word: 'Pizza' },
  { emoji: '🍪', word: 'Cookie' },
  { emoji: '🍬', word: 'Candy' },
  { emoji: '🍦', word: 'Ice Cream' },
  { emoji: '🍩', word: 'Donut' },
  { emoji: '🍯', word: 'Honey' },
  { emoji: '🚂', word: 'Train' },
  { emoji: '✈️', word: 'Plane' },
  { emoji: '⛵', word: 'Boat' },
  { emoji: '🚲', word: 'Bike' },
  { emoji: '🚚', word: 'Truck' },
  { emoji: '🚀', word: 'Rocket' },
  { emoji: '⏰', word: 'Clock' },
  { emoji: '🔑', word: 'Key' },
  { emoji: '🚪', word: 'Door' },
  { emoji: '🛏️', word: 'Bed' },
  { emoji: '🪑', word: 'Chair' },
  { emoji: '☕', word: 'Cup' },
  { emoji: '🎩', word: 'Hat' },
  { emoji: '🧦', word: 'Sock' },
  { emoji: '☂️', word: 'Umbrella' },
  { emoji: '🎈', word: 'Balloon' },
  { emoji: '🎁', word: 'Gift' },
  { emoji: '🥁', word: 'Drum' },
  { emoji: '🎸', word: 'Guitar' },
  { emoji: '🤖', word: 'Robot' },
  { emoji: '🪁', word: 'Kite' },
  { emoji: '🌸', word: 'Flower' },
  { emoji: '🌈', word: 'Rainbow' },
]);

/**
 * Difficulty levels; each pool is a prefix of WORDS.
 * @type {Readonly<Record<string, {label: string, count: number}>>}
 */
export const DIFFICULTIES = Object.freeze({
  easy: { label: 'Easy', count: 10 },
  medium: { label: 'Medium', count: 25 },
  hard: { label: 'Hard', count: 100 },
});

/**
 * Returns the word pool for a difficulty.
 * @param {string} difficulty key of DIFFICULTIES
 * @returns {readonly WordEntry[]}
 */
export function getPool(difficulty) {
  return WORDS.slice(0, DIFFICULTIES[difficulty].count);
}

/**
 * Returns a new array with the items shuffled (Fisher–Yates, input untouched).
 * @template T
 * @param {readonly T[]} items
 * @returns {T[]}
 */
export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Creates an endless word supplier for a difficulty: deals the whole pool in
 * random order, then reshuffles, so words never repeat until all were seen.
 * @param {string} difficulty key of DIFFICULTIES
 * @returns {() => WordEntry}
 */
export function createWordCycler(difficulty) {
  const source = getPool(difficulty);
  let pool = shuffle(source);
  let index = 0;
  return () => {
    if (index >= pool.length) {
      pool = shuffle(source);
      index = 0;
    }
    return pool[index++];
  };
}

/**
 * Builds three shuffled answer options: the correct word plus two distractors
 * drawn from the same difficulty pool, so choices stay age-appropriate.
 * @param {WordEntry} answer
 * @param {string} difficulty key of DIFFICULTIES
 * @returns {string[]}
 */
export function buildOptions(answer, difficulty) {
  const distractors = shuffle(getPool(difficulty).filter((w) => w.word !== answer.word))
    .slice(0, 2)
    .map((w) => w.word);
  return shuffle([answer.word, ...distractors]);
}
