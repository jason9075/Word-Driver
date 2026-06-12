import { speak } from './speech.js';

const CORRECT_DELAY_MS = 1100;
const WRONG_DELAY_MS = 1600;

/**
 * Controls the emoji quiz panel. Shows a big emoji and three word buttons;
 * after a pick it highlights the answer, speaks it, then reports the result.
 *
 * @param {{onResult: (correct: boolean) => void}} callbacks
 * @returns {{show: (entry: import('./words.js').WordEntry, options: string[]) => void, hide: () => void}}
 */
export function createQuizPanel(callbacks) {
  const panel = document.getElementById('quiz');
  const emojiBox = document.getElementById('quiz-emoji');
  const optionsBox = document.getElementById('quiz-options');

  /**
   * @param {import('./words.js').WordEntry} entry
   * @param {string[]} options
   */
  function show(entry, options) {
    emojiBox.textContent = entry.emoji;
    optionsBox.replaceChildren();

    /** @type {HTMLButtonElement[]} */
    const buttons = options.map((word) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-button';
      button.textContent = word;
      optionsBox.appendChild(button);
      return button;
    });

    for (const button of buttons) {
      button.addEventListener('click', () => {
        const correct = button.textContent === entry.word;
        for (const b of buttons) b.disabled = true;

        if (correct) {
          button.classList.add('correct');
          speak(`${entry.word}! Great job!`);
        } else {
          button.classList.add('wrong');
          const answerButton = buttons.find((b) => b.textContent === entry.word);
          if (answerButton) answerButton.classList.add('correct');
          speak(`Oops! It is ${entry.word}.`);
        }

        setTimeout(() => {
          hide();
          callbacks.onResult(correct);
        }, correct ? CORRECT_DELAY_MS : WRONG_DELAY_MS);
      });
    }

    panel.hidden = false;
    speak('What is this?');
  }

  function hide() {
    panel.hidden = true;
  }

  return { show, hide };
}
