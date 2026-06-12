import './style.css';
import { CarWordsGame, STREAK_GOAL } from './game.js';
import { createMenu } from './menu.js';
import { createQuizPanel } from './quiz.js';
import { isSoundEnabled, setSoundEnabled, speak } from './speech.js';
import { getBest, recordScore, unlockVehicle } from './storage.js';
import { VEHICLES } from './vehicles.js';
import { playWin } from './sounds.js';
import { DIFFICULTIES, buildOptions, createWordCycler } from './words.js';

const CRASH_SCREEN_MS = 2400;
const CONFETTI_COUNT = 36;
const CELEBRATE_EVERY = 5;

const canvas = document.getElementById('canvas');
const soundToggle = document.getElementById('sound-toggle');
const backToMenuButton = document.getElementById('back-to-menu');
const crashScreen = document.getElementById('crash-screen');
const winScreen = document.getElementById('win-screen');
const unlockMessage = document.getElementById('unlock-message');
const menuButton = document.getElementById('menu-button');

// Left-side status panel elements
const statusVehicle = document.getElementById('status-vehicle');
const statusDifficulty = document.getElementById('status-difficulty');
const statusStreak = document.getElementById('status-streak');
const statusBest = document.getElementById('status-best');
const statusProgressBar = document.getElementById('status-progress-bar');

let difficulty = 'easy';
let selectedVehicleEmoji = '🚗';

/** @param {number} score */
function updateStatus(score) {
  statusStreak.textContent = `${score} / ${STREAK_GOAL}`;
  statusBest.textContent = `🏆 ${getBest(difficulty)}`;
  statusProgressBar.style.width = `${(score / STREAK_GOAL) * 100}%`;
}

/** @param {string} diff @param {string} emoji */
function setStatusMeta(diff, emoji) {
  statusDifficulty.textContent = DIFFICULTIES[diff].label;
  statusVehicle.textContent = emoji;
}

const quiz = createQuizPanel({
  onResult(correct) {
    if (correct) {
      game.answerCorrect();
    } else {
      game.answerWrong();
    }
  },
});

const game = new CarWordsGame(canvas, createWordCycler(difficulty), {
  onQuiz(entry) {
    quiz.show(entry, buildOptions(entry, difficulty));
  },
  onProgress(score) {
    updateStatus(score);
    if (score > 0 && score < STREAK_GOAL && score % CELEBRATE_EVERY === 0) {
      speak(`Hooray! ${score} stars!`);
      dropConfetti();
    }
  },
  onCrashDone(score) {
    recordScore(difficulty, score);
    updateStatus(score);
    crashScreen.hidden = false;
    speak('Oops! Let us try again!');
    setTimeout(() => {
      crashScreen.hidden = true;
      updateStatus(0);
      game.reset(true);
    }, CRASH_SCREEN_MS);
  },
  onWin(score) {
    recordScore(difficulty, score);
    updateStatus(score);
    const reward = VEHICLES.find((v) => v.unlockedBy === difficulty);
    const newUnlock = reward ? unlockVehicle(reward.id) : false;
    unlockMessage.hidden = !newUnlock;
    if (newUnlock) {
      unlockMessage.textContent = `${reward.emoji} New car unlocked: ${reward.name}!`;
    }
    winScreen.hidden = false;
    playWin();
    speak(newUnlock ? `You did it! You got a new ${reward.name}!` : 'You did it! Hooray!');
    dropConfetti();
  },
});

const menu = createMenu({
  onStart(selectedDifficulty, vehicleId) {
    difficulty = selectedDifficulty;
    const vehicle = VEHICLES.find((v) => v.id === vehicleId);
    selectedVehicleEmoji = vehicle ? vehicle.emoji : '🚗';
    setStatusMeta(difficulty, selectedVehicleEmoji);
    game.setVehicle(vehicleId);
    game.setWordSource(createWordCycler(difficulty));
    updateStatus(0);
    speak('Let us go!');
    game.reset(true);
  },
});
menu.show();
setStatusMeta(difficulty, selectedVehicleEmoji);
updateStatus(0);

menuButton.addEventListener('click', () => {
  winScreen.hidden = true;
  game.reset(false);
  menu.show();
});

backToMenuButton.addEventListener('click', () => {
  quiz.hide();
  crashScreen.hidden = true;
  game.reset(false);
  menu.show();
});

soundToggle.addEventListener('click', () => {
  setSoundEnabled(!isSoundEnabled());
  soundToggle.textContent = isSoundEnabled() ? '🔊 Sound: On' : '🔇 Sound: Off';
});

/** Rains celebratory emoji down the screen, then cleans them up. */
function dropConfetti() {
  const emoji = ['🎉', '⭐', '🎈', '🏆', '✨'];
  for (let i = 0; i < CONFETTI_COUNT; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.textContent = emoji[i % emoji.length];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.animationDuration = `${2 + Math.random() * 2.5}s`;
    piece.style.animationDelay = `${Math.random() * 1.5}s`;
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}
