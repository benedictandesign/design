import * as THREE from 'three';
import { initScene, camera, controls } from './scene.js';
import { initGrids } from './grid.js';
import { loadPointCloud } from './pointCloudLoader.js';
import { animate } from './animation.js';
import { overlayData } from './overlayData.js';
import { renderOverlay } from './overlayRenderer.js';

const overlay = document.getElementById('overlay');
const viewport = document.getElementById('overlay-viewport');
const nav = document.getElementById('bottom-nav');
const slider = document.getElementById('nav-slider');
const navLinks = [...document.querySelectorAll('.nav-link')];

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const cameraPositions = {
  home: new THREE.Vector3(0, 0, 1),
  works: new THREE.Vector3(0, 0, 1.3),
  about: new THREE.Vector3(0, 0, 1.3)
};

let currentSection = 'home';

function updateSlider(activeLink) {
  slider.style.width = `${activeLink.offsetWidth}px`;
  slider.style.left = `${activeLink.offsetLeft}px`;
}

function setActiveLink(section) {
  const activeLink = navLinks.find(link => link.dataset.section === section);
  if (!activeLink) return;
  navLinks.forEach(link => link.classList.toggle('active', link === activeLink));
  updateSlider(activeLink);
}

function showOverlay(section) {
  currentSection = section;
  overlay.dataset.section = section;
  overlay.scrollTop = 0;
  renderOverlay(viewport, section, overlayData[section]);
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => { overlay.scrollTop = 0; });
  controls.enabled = false;
  document.body.dataset.section = section;
  document.body.classList.add('overlay-open');
}

function hideOverlay() {
  overlay.classList.add('hidden');
  viewport.replaceChildren();
  controls.enabled = true;
  currentSection = 'home';
  delete overlay.dataset.section;
  delete document.body.dataset.section;
  delete document.body.dataset.activeRegion;
  document.body.classList.remove('overlay-open');
}

function navigateToSection(section, updateHistory = true) {
  if (!cameraPositions[section]) section = 'home';
  setActiveLink(section);

  if (section === 'home') hideOverlay();
  else if (section !== currentSection) showOverlay(section);

  tweenCamera(cameraPositions[section], controls.target.clone());
  if (updateHistory) history.replaceState(null, '', `#${section}`);
}

nav.addEventListener('click', (event) => {
  const link = event.target.closest('.nav-link');
  if (!link) return;
  event.preventDefault();
  navigateToSection(link.dataset.section);
});

window.addEventListener('hashchange', () => {
  navigateToSection(location.hash.slice(1), false);
});

window.addEventListener('resize', () => setActiveLink(currentSection));

// ───────────────────────────── Three.js setup ──────────────────────────────
initScene();
initGrids();
loadPointCloud();
animate();

const initialSection = location.hash.slice(1);
navigateToSection(initialSection === 'works' || initialSection === 'about' ? initialSection : 'home', false);
document.fonts?.ready.then(() => setActiveLink(currentSection));

// ───────────────────────────── Camera tweening ─────────────────────────────
function tweenCamera(targetPos, targetLookAt, duration = 800) {
  const startPos = camera.position.clone();
  const startQuat = camera.quaternion.clone();

  camera.position.copy(targetPos);
  camera.lookAt(targetLookAt);
  const targetQuat = camera.quaternion.clone();

  camera.position.copy(startPos);
  camera.quaternion.copy(startQuat);

  let startTime = null;
  function animateCamera(now) {
    if (!startTime) startTime = now;
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(startPos, targetPos, eased);
    camera.quaternion.copy(startQuat).slerp(targetQuat, eased);

    if (progress < 1) requestAnimationFrame(animateCamera);
  }

  requestAnimationFrame(animateCamera);
}
