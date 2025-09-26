import * as THREE            from 'three';
import { OrbitControls }     from 'three/examples/jsm/controls/OrbitControls.js';

export let scene;
export let camera;
export let renderer;
export let controls;

/**
 * Call once at startup to build the core Three.js scene + camera + renderer + postprocessing.
 */
export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  window.addEventListener('resize', onWindowResize);
}

/**
 * Must be called each frame (or just after updating anything in the scene).
 */
export function renderScene() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
