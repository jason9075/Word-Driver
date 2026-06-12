import { isUnlocked, getBest } from './storage.js';
import { VEHICLES } from './vehicles.js';
import { DIFFICULTIES } from './words.js';

/**
 * The start-screen menu: pick a difficulty (with best streak shown) and an
 * unlocked vehicle, then start a run. Locked vehicles show which difficulty
 * to clear. Re-rendered on every show() so fresh unlocks appear.
 *
 * @param {{onStart: (difficulty: string, vehicleId: string) => void}} callbacks
 * @returns {{show: () => void, hide: () => void}}
 */
export function createMenu(callbacks) {
  const screen = document.getElementById('start-screen');
  const difficultyBox = document.getElementById('difficulty-options');
  const vehicleBox = document.getElementById('vehicle-options');
  const startButton = document.getElementById('start-button');

  let difficulty = 'easy';
  let vehicleId = 'classic';

  function renderDifficulties() {
    difficultyBox.replaceChildren();
    for (const [key, { label }] of Object.entries(DIFFICULTIES)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pick-button';
      button.classList.toggle('selected', key === difficulty);
      const best = getBest(key);
      button.innerHTML = `${label}<span class="best-tag">🏆 ${best}</span>`;
      button.addEventListener('click', () => {
        difficulty = key;
        renderDifficulties();
      });
      difficultyBox.appendChild(button);
    }
  }

  function renderVehicles() {
    // If the selected vehicle got locked out (fresh storage), fall back.
    if (!isUnlocked(vehicleId)) vehicleId = 'classic';
    vehicleBox.replaceChildren();
    for (const vehicle of VEHICLES) {
      const unlocked = isUnlocked(vehicle.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pick-button vehicle-button';
      button.classList.toggle('selected', vehicle.id === vehicleId);
      button.classList.toggle('locked', !unlocked);
      button.disabled = !unlocked;
      button.textContent = unlocked ? vehicle.emoji : '🔒';
      button.title = unlocked
        ? vehicle.name
        : `Clear ${DIFFICULTIES[vehicle.unlockedBy].label} (30 in a row) to unlock!`;
      button.addEventListener('click', () => {
        vehicleId = vehicle.id;
        renderVehicles();
      });
      vehicleBox.appendChild(button);
    }
  }

  startButton.addEventListener('click', () => {
    screen.hidden = true;
    callbacks.onStart(difficulty, vehicleId);
  });

  return {
    show() {
      renderDifficulties();
      renderVehicles();
      screen.hidden = false;
    },
    hide() {
      screen.hidden = true;
    },
  };
}
