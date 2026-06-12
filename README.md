# 🚗 Word Driver

A 3D vocabulary driving game for toddlers built with Three.js. Drive your car down the road — when you hit an obstacle, a word challenge pops up. Answer correctly to clear the way; answer wrong and crash! Reach 30 correct answers in a row to win and unlock a new vehicle.

**[▶ Play Live Demo](https://jason9075.github.io/Word-Driver/)**

![Word Driver gameplay](https://raw.githubusercontent.com/jason9075/Word-Driver/main/docs/preview.gif)

---

## Features

- **3D driving scene** — Low-poly road, trees, clouds, and recycled obstacles (rocks, traffic cones, logs, potholes) that scroll forever.
- **Emoji word quiz** — Each obstacle reveals a big emoji with three word choices. Tap the right word to blast it away.
- **3 difficulty levels**
  | Level  | Word pool | Goal |
  |--------|-----------|------|
  | Easy   | 10 words  | 30 in a row |
  | Medium | 25 words  | 30 in a row |
  | Hard   | 100 words | 30 in a row |
- **Unlock vehicles** — Clear Easy to unlock the 🚚 Truck, Medium for the 🏎️ Race Car, Hard for the 🚀 Rocket Car.
- **Persistent high scores** — Best streak per difficulty saved in `localStorage`.
- **Web Speech API** — Words and feedback are spoken aloud (toggle in toolbar).
- **Pure front-end** — No server required; deployable to GitHub Pages with one push.

---

## Getting Started

### Prerequisites

- Node.js 18+ (or enter the Nix dev shell — see below)

### Install and run

```sh
npm install
npm run dev        # http://localhost:8080
```

### Build for production

```sh
npm run build      # outputs to dist/
```

### NixOS / Flake users

```sh
nix develop        # or: direnv allow
just install
just dev
```

---

## Project Structure

```
src/
├── main.js        # Entry point — wires all modules together
├── game.js        # Three.js scene + game state machine (CarWordsGame)
├── vehicles.js    # Low-poly 3D vehicle models (classic / truck / racecar / rocket)
├── words.js       # 100-word bank, difficulty pools, word cycler
├── quiz.js        # Emoji quiz panel UI
├── menu.js        # Start-screen difficulty & vehicle picker
├── storage.js     # localStorage wrapper (best scores, unlocked vehicles)
├── speech.js      # Web Speech API helper
└── style.css      # Candy-coloured game UI
```

---

## Deployment (GitHub Pages)

Push to the `main` branch — GitHub Actions builds and deploys automatically.

```sh
git add -A
git commit -m "feat: initial release"
git push origin main
```

The workflow (`.github/workflows/deploy.yml`) runs `npm ci && npm run build` and uploads `dist/` to GitHub Pages.

> Make sure `vite.config.js` has `base: '/Word-Driver/'` (or your repo name) for assets to resolve correctly.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Three.js](https://threejs.org/) | 3D scene rendering |
| [Vite](https://vitejs.dev/) | Dev server & bundler |
| Web Speech API | Word pronunciation |
| localStorage | Score persistence |

---

## License

[MIT](./LICENSE) © 2026 [Jason Kuan](https://github.com/jason9075)
