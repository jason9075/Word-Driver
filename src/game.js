import * as THREE from 'three';

import { buildVehicle } from './vehicles.js';

/**
 * @typedef {import('./words.js').WordEntry} WordEntry
 * @typedef {{group: THREE.Group, entry: WordEntry, clearTime: number}} Obstacle
 */

/** Game lifecycle states. */
export const GameState = Object.freeze({
  IDLE: 'idle',
  DRIVING: 'driving',
  QUIZ: 'quiz',
  CLEARING: 'clearing',
  CRASHING: 'crashing',
  FINISHED: 'finished',
});

/** Consecutive correct answers needed to clear a difficulty. */
export const STREAK_GOAL = 30;

const MAX_SPEED = 20;            // units per second on the open road
const BRAKE_DISTANCE = 28;       // start easing off this far from an obstacle
const STOP_GAP = 7;              // resting distance between car and obstacle
const OBSTACLE_SPACING = 55;     // distance between consecutive obstacles
const FIRST_OBSTACLE_Z = -70;    // car starts at z = 0 and drives toward -z
const OBSTACLE_POOL = 6;         // active obstacles recycled forever
const CLEAR_DURATION = 0.9;      // seconds for the obstacle fly-away animation
const CRASH_DURATION = 1.8;      // seconds for the crash animation

const DASH_COUNT = 60;
const DASH_SPACING = 9;
const TREE_ROWS = 30;
const TREE_SPACING = 16;
const CLOUD_COUNT = 14;
const CLOUD_SPACING = 40;
const RECYCLE_MARGIN = 40;       // recycle decor once this far behind the car

const PALETTE = Object.freeze({
  sky: 0x87ceeb,
  grass: 0x7cb96a,
  road: 0x5c6378,
  lane: 0xfff8e7,
  rock: 0x9aa5b8,
  cone: 0xff8c42,
  log: 0x8b5a2b,
  pit: 0x2d2a3e,
  trunk: 0x9c6644,
});

/**
 * The endless driving scene and game state machine. DOM/quiz logic lives
 * outside; the game only reports events through the callbacks given at
 * construction. Obstacles, road dashes, trees and clouds are pooled and
 * recycled ahead of the car, so the run never ends.
 */
export class CarWordsGame {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {() => WordEntry} nextWord endless word supplier
   * @param {{
   *   onQuiz: (entry: WordEntry) => void,
   *   onProgress: (score: number) => void,
   *   onCrashDone: (score: number) => void,
   *   onWin: (score: number) => void,
   * }} callbacks
   */
  constructor(canvas, nextWord, callbacks) {
    this.nextWord = nextWord;
    this.callbacks = callbacks;
    this.state = GameState.IDLE;
    this.speed = 0;
    this.score = 0;
    this.crashTime = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(PALETTE.sky);
    this.scene.fog = new THREE.Fog(PALETTE.sky, 60, 220);

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
    this.camera.position.set(0, 6, 14);

    this.buildLights();
    this.buildGround();
    /** @type {THREE.Group | null} */
    this.car = null;
    this.setVehicle('classic');

    /** Queue of active obstacles; index 0 is always the next one ahead. */
    /** @type {Obstacle[]} */
    this.queue = [];
    this.frontierZ = FIRST_OBSTACLE_Z;
    for (let i = 0; i < OBSTACLE_POOL; i += 1) {
      this.frontierZ = FIRST_OBSTACLE_Z - i * OBSTACLE_SPACING;
      this.queue.push(this.buildObstacle(i, this.frontierZ));
    }
    this.buildDecor();

    this.clock = new THREE.Clock();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  /* ── Scene construction ─────────────────────────────────────────── */

  buildLights() {
    const sun = new THREE.DirectionalLight(0xfff4e0, 2.2);
    sun.position.set(20, 40, 10);
    this.scene.add(sun);
    this.scene.add(new THREE.HemisphereLight(PALETTE.sky, PALETTE.grass, 0.9));
  }

  buildGround() {
    // Grass and road are uniform planes re-centred on the car every frame,
    // so they only need to be long enough to cover the visible range.
    this.grass = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 1000),
      new THREE.MeshLambertMaterial({ color: PALETTE.grass })
    );
    this.grass.rotation.x = -Math.PI / 2;
    this.scene.add(this.grass);

    this.road = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 1000),
      new THREE.MeshLambertMaterial({ color: PALETTE.road })
    );
    this.road.rotation.x = -Math.PI / 2;
    this.road.position.y = 0.01;
    this.scene.add(this.road);

    /** @type {THREE.Mesh[]} */
    this.dashes = [];
    const dashGeometry = new THREE.PlaneGeometry(0.35, 3);
    const dashMaterial = new THREE.MeshLambertMaterial({ color: PALETTE.lane });
    for (let i = 0; i < DASH_COUNT; i += 1) {
      const dash = new THREE.Mesh(dashGeometry, dashMaterial);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, 30 - i * DASH_SPACING);
      this.scene.add(dash);
      this.dashes.push(dash);
    }
  }

  /**
   * Swaps the player's vehicle, keeping the current position and rotation.
   * @param {string} vehicleId one of the ids in vehicles.js
   */
  setVehicle(vehicleId) {
    const { group, wheels } = buildVehicle(vehicleId);
    if (this.car) {
      group.position.copy(this.car.position);
      group.rotation.copy(this.car.rotation);
      this.scene.remove(this.car);
    }
    this.car = group;
    this.wheels = wheels;
    this.scene.add(group);
  }

  /**
   * Swaps the word supplier (e.g. on difficulty change). Takes effect for
   * newly spawned words; call reset() afterwards for a clean run.
   * @param {() => WordEntry} nextWord
   */
  setWordSource(nextWord) {
    this.nextWord = nextWord;
  }

  /**
   * @param {number} index decides the obstacle's look (rotates through 4 kinds)
   * @param {number} z initial road position
   * @returns {Obstacle}
   */
  buildObstacle(index, z) {
    const group = new THREE.Group();
    const kind = index % 4;
    if (kind === 0) {
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.6),
        new THREE.MeshLambertMaterial({ color: PALETTE.rock })
      );
      rock.position.y = 1.1;
      group.add(rock);
    } else if (kind === 1) {
      const coneMaterial = new THREE.MeshLambertMaterial({ color: PALETTE.cone });
      for (const x of [-1.6, 0, 1.6]) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 12), coneMaterial);
        cone.position.set(x, 0.9, 0);
        group.add(cone);
      }
    } else if (kind === 2) {
      const log = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 6, 12),
        new THREE.MeshLambertMaterial({ color: PALETTE.log })
      );
      log.rotation.z = Math.PI / 2;
      log.position.y = 0.8;
      group.add(log);
    } else {
      const pit = new THREE.Mesh(
        new THREE.CircleGeometry(2.4, 24),
        new THREE.MeshBasicMaterial({ color: PALETTE.pit })
      );
      pit.rotation.x = -Math.PI / 2;
      pit.position.y = 0.03;
      group.add(pit);
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.18, 8, 24),
        new THREE.MeshLambertMaterial({ color: PALETTE.rock })
      );
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = 0.1;
      group.add(rim);
    }
    group.position.z = z;
    this.scene.add(group);
    return { group, entry: this.nextWord(), clearTime: 0 };
  }

  buildDecor() {
    /** @type {THREE.Group[]} */
    this.trees = [];
    const trunkGeometry = new THREE.CylinderGeometry(0.35, 0.45, 2, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: PALETTE.trunk });
    const leafGeometry = new THREE.ConeGeometry(1.8, 3.6, 10);
    for (let i = 0; i < TREE_ROWS; i += 1) {
      for (const side of [-1, 1]) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        const leaves = new THREE.Mesh(
          leafGeometry,
          new THREE.MeshLambertMaterial({ color: Math.random() > 0.5 ? 0x52b788 : 0x40916c })
        );
        leaves.position.y = 3.6;
        tree.add(trunk, leaves);
        tree.scale.setScalar(0.8 + Math.random() * 0.7);
        tree.position.set(
          side * (9 + Math.random() * 14),
          0,
          -10 - i * TREE_SPACING + Math.random() * 8
        );
        this.scene.add(tree);
        this.trees.push(tree);
      }
    }

    /** @type {THREE.Group[]} */
    this.clouds = [];
    const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      const cloud = new THREE.Group();
      for (let j = 0; j < 3; j += 1) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.6 + Math.random(), 10, 10), cloudMaterial);
        puff.position.set(j * 1.8 - 1.8, Math.random() * 0.5, Math.random());
        cloud.add(puff);
      }
      cloud.position.set((Math.random() - 0.5) * 120, 20 + Math.random() * 14, -i * CLOUD_SPACING);
      this.scene.add(cloud);
      this.clouds.push(cloud);
    }
  }

  /* ── Public controls ────────────────────────────────────────────── */

  /** Starts (or resumes) driving from the current position. */
  start() {
    this.state = GameState.DRIVING;
  }

  /** Called by the quiz UI when the kid picked the right word. */
  answerCorrect() {
    if (this.state !== GameState.QUIZ) return;
    this.state = GameState.CLEARING;
    this.queue[0].clearTime = 0;
  }

  /** Called by the quiz UI when the kid picked a wrong word. */
  answerWrong() {
    if (this.state !== GameState.QUIZ) return;
    this.state = GameState.CRASHING;
    this.crashTime = 0;
  }

  /**
   * Puts the car back at the start line with a fresh run of obstacles.
   * @param {boolean} autoStart drive immediately after the reset
   */
  reset(autoStart) {
    this.queue.forEach((obstacle, i) => {
      this.frontierZ = FIRST_OBSTACLE_Z - i * OBSTACLE_SPACING;
      this.respawnObstacle(obstacle, this.frontierZ);
    });
    this.score = 0;
    this.speed = 0;
    this.car.position.set(0, 0, 0);
    this.car.rotation.set(0, 0, 0);
    this.callbacks.onProgress(0);
    this.state = autoStart ? GameState.DRIVING : GameState.IDLE;
  }

  /**
   * Resets an obstacle's transform, gives it a new word and places it at `z`.
   * @param {Obstacle} obstacle
   * @param {number} z
   */
  respawnObstacle(obstacle, z) {
    obstacle.group.position.set(0, 0, z);
    obstacle.group.rotation.set(0, 0, 0);
    obstacle.group.scale.setScalar(1);
    obstacle.entry = this.nextWord();
    obstacle.clearTime = 0;
  }

  /* ── Per-frame update ───────────────────────────────────────────── */

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);

    if (this.state === GameState.DRIVING) this.updateDriving(dt);
    else if (this.state === GameState.CLEARING) this.updateClearing(dt);
    else if (this.state === GameState.CRASHING) this.updateCrashing(dt);

    this.recycleScenery();
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  }

  /** @param {number} dt */
  updateDriving(dt) {
    const next = this.queue[0];
    const distance = this.car.position.z - next.group.position.z;

    // Brake target shrinks linearly with distance → smooth ease-out stop.
    let targetSpeed = MAX_SPEED;
    if (distance < BRAKE_DISTANCE) {
      targetSpeed = Math.max(0, (distance - STOP_GAP) * 1.4);
    }
    if (distance <= STOP_GAP + 0.3) {
      this.speed = 0;
      this.state = GameState.QUIZ;
      this.callbacks.onQuiz(next.entry);
      return;
    }

    this.speed += (targetSpeed - this.speed) * (1 - Math.exp(-2.5 * dt));
    this.car.position.z -= this.speed * dt;
    this.spinWheels(dt);
  }

  /** @param {number} dt */
  updateClearing(dt) {
    const obstacle = this.queue[0];
    obstacle.clearTime += dt;
    const progress = Math.min(obstacle.clearTime / CLEAR_DURATION, 1);
    obstacle.group.position.y = 12 * progress * progress;
    obstacle.group.rotation.y += 7 * dt;
    obstacle.group.scale.setScalar(Math.max(1 - progress, 0.001));
    if (progress >= 1) {
      // Send the cleared obstacle to the back of the queue, far ahead.
      this.queue.shift();
      this.frontierZ -= OBSTACLE_SPACING;
      this.respawnObstacle(obstacle, this.frontierZ);
      this.queue.push(obstacle);
      this.score += 1;
      this.callbacks.onProgress(this.score);
      if (this.score >= STREAK_GOAL) {
        this.speed = 0;
        this.state = GameState.FINISHED;
        this.callbacks.onWin(this.score);
      } else {
        this.state = GameState.DRIVING;
      }
    }
  }

  /** @param {number} dt */
  updateCrashing(dt) {
    this.crashTime += dt;
    const progress = Math.min(this.crashTime / CRASH_DURATION, 1);
    const obstacle = this.queue[0];

    // Lurch into the obstacle, then tip over while spinning.
    const targetZ = obstacle.group.position.z + 3;
    this.car.position.z += (targetZ - this.car.position.z) * (1 - Math.exp(-5 * dt));
    this.car.rotation.z = Math.sin(progress * Math.PI) * 0.5;
    this.car.rotation.y = progress * Math.PI * 1.5;
    this.car.position.y = Math.sin(progress * Math.PI) * 1.2;

    if (progress >= 1) {
      this.state = GameState.IDLE;
      this.callbacks.onCrashDone(this.score);
    }
  }

  /** Moves ground planes with the car and recycles decor that fell behind. */
  recycleScenery() {
    const carZ = this.car.position.z;
    this.grass.position.z = carZ - 300;
    this.road.position.z = carZ - 300;

    for (const dash of this.dashes) {
      if (dash.position.z > carZ + RECYCLE_MARGIN) {
        dash.position.z -= DASH_COUNT * DASH_SPACING;
      }
    }
    for (const tree of this.trees) {
      if (tree.position.z > carZ + RECYCLE_MARGIN) {
        tree.position.z -= TREE_ROWS * TREE_SPACING;
      }
    }
    for (const cloud of this.clouds) {
      if (cloud.position.z > carZ + RECYCLE_MARGIN * 2) {
        cloud.position.z -= CLOUD_COUNT * CLOUD_SPACING;
      }
    }
  }

  /** @param {number} dt */
  spinWheels(dt) {
    for (const wheel of this.wheels) {
      wheel.rotation.x -= (this.speed * dt) / 0.5;
    }
  }

  /** @param {number} dt */
  updateCamera(dt) {
    // 30° left-side view: camera sits left-rear of the car, elevated, so the
    // car occupies the left-centre of the frame and the road stretches right.
    const shake = this.state === GameState.CRASHING ? (Math.random() - 0.5) * 0.4 : 0;
    const target = new THREE.Vector3(
      -11 + shake,   // offset left
      9,             // elevation gives ~30° pitch
      this.car.position.z + 12
    );
    this.camera.position.lerp(target, 1 - Math.exp(-4 * dt));
    // Look slightly right of centre so the road ahead is visible on the right
    this.camera.lookAt(2, 1, this.car.position.z - 6);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
