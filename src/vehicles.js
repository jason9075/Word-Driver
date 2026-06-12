import * as THREE from 'three';

/**
 * Playable vehicles. `unlockedBy` names the difficulty whose clear (30-streak)
 * unlocks the vehicle; null means available from the start.
 * @typedef {{id: string, name: string, emoji: string, unlockedBy: string | null}} VehicleMeta
 */

/** @type {readonly VehicleMeta[]} */
export const VEHICLES = Object.freeze([
  { id: 'classic', name: 'Red Car', emoji: '🚗', unlockedBy: null },
  { id: 'truck', name: 'Truck', emoji: '🚚', unlockedBy: 'easy' },
  { id: 'racecar', name: 'Race Car', emoji: '🏎️', unlockedBy: 'medium' },
  { id: 'rocket', name: 'Rocket Car', emoji: '🚀', unlockedBy: 'hard' },
]);

const WHEEL_COLOR = 0x3a3845;
const LIGHT_COLOR = 0xfff3b0;

/**
 * @param {number} color
 * @returns {THREE.MeshLambertMaterial}
 */
function lambert(color) {
  return new THREE.MeshLambertMaterial({ color });
}

/**
 * Adds spinnable wheels to a vehicle at the given [x, z] offsets.
 * @param {THREE.Group} group
 * @param {[number, number][]} positions
 * @param {number} radius
 * @returns {THREE.Mesh[]}
 */
function addWheels(group, positions, radius = 0.5) {
  const geometry = new THREE.CylinderGeometry(radius, radius, 0.4, 16);
  const material = lambert(WHEEL_COLOR);
  return positions.map(([x, z]) => {
    const wheel = new THREE.Mesh(geometry, material);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, radius, z);
    group.add(wheel);
    return wheel;
  });
}

/**
 * @param {THREE.Group} group
 * @param {number} y
 * @param {number} z
 */
function addHeadlights(group, y, z) {
  const material = new THREE.MeshBasicMaterial({ color: LIGHT_COLOR });
  for (const x of [-0.7, 0.7]) {
    const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.1), material);
    headlight.position.set(x, y, z);
    group.add(headlight);
  }
}

/** @returns {{group: THREE.Group, wheels: THREE.Mesh[]}} */
function buildClassic() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 4.2), lambert(0xff6b6b));
  body.position.y = 0.95;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2), lambert(0xfff8e7));
  cabin.position.set(0, 1.75, 0.3);
  group.add(body, cabin);
  addHeadlights(group, 0.95, -2.12);
  const wheels = addWheels(group, [[-1.1, -1.3], [1.1, -1.3], [-1.1, 1.3], [1.1, 1.3]]);
  return { group, wheels };
}

/** @returns {{group: THREE.Group, wheels: THREE.Mesh[]}} */
function buildTruck() {
  const group = new THREE.Group();
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 1.7), lambert(0xffd93d));
  cab.position.set(0, 1.35, -1.9);
  const cargo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.1, 3.4), lambert(0xfff8e7));
  cargo.position.set(0, 1.65, 0.9);
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.5, 0.4), lambert(0x9aa5b8));
  bumper.position.set(0, 0.6, -2.8);
  group.add(cab, cargo, bumper);
  addHeadlights(group, 0.95, -2.78);
  const wheels = addWheels(
    group,
    [[-1.15, -1.9], [1.15, -1.9], [-1.15, 0.4], [1.15, 0.4], [-1.15, 1.7], [1.15, 1.7]],
    0.55
  );
  return { group, wheels };
}

/** @returns {{group: THREE.Group, wheels: THREE.Mesh[]}} */
function buildRaceCar() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 4.6), lambert(0x4d96ff));
  body.position.y = 0.7;
  const nose = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.9), lambert(0x4d96ff));
  nose.position.set(0, 0.6, -2.6);
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 1.4), lambert(0x3a3845));
  cockpit.position.set(0, 1.15, 0.2);
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 0.7), lambert(0xffd93d));
  spoiler.position.set(0, 1.45, 2.1);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), lambert(0x3a3845));
  post.position.set(0, 1.1, 2.1);
  group.add(body, nose, cockpit, spoiler, post);
  addHeadlights(group, 0.7, -2.32);
  const wheels = addWheels(group, [[-1.2, -1.5], [1.2, -1.5], [-1.2, 1.5], [1.2, 1.5]]);
  return { group, wheels };
}

/** @returns {{group: THREE.Group, wheels: THREE.Mesh[]}} */
function buildRocketCar() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.4, 16), lambert(0xfff8e7));
  body.rotation.x = Math.PI / 2;
  body.position.y = 1.2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 16), lambert(0xff6b6b));
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 1.2, -2.5);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 1.2, 12),
    new THREE.MeshBasicMaterial({ color: 0xff8c42 })
  );
  flame.rotation.x = Math.PI / 2;
  flame.position.set(0, 1.2, 2.3);
  group.add(body, nose, flame);
  for (const [x, y] of [[-1, 1.2], [1, 1.2], [0, 2.2]]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1, 1.1), lambert(0x9b5de5));
    fin.position.set(x, y, 1.4);
    fin.rotation.z = x === 0 ? 0 : x * -0.5;
    group.add(fin);
  }
  const wheels = addWheels(group, [[-1.05, -1.2], [1.05, -1.2], [-1.05, 1.2], [1.05, 1.2]]);
  return { group, wheels };
}

const BUILDERS = Object.freeze({
  classic: buildClassic,
  truck: buildTruck,
  racecar: buildRaceCar,
  rocket: buildRocketCar,
});

/**
 * Builds the 3D model for a vehicle (facing -z, wheels resting on y = 0).
 * @param {string} id one of VEHICLES ids; unknown ids fall back to classic
 * @returns {{group: THREE.Group, wheels: THREE.Mesh[]}}
 */
export function buildVehicle(id) {
  return (BUILDERS[id] ?? buildClassic)();
}
