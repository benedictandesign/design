import * as THREE from 'three';
import { initScene, camera, controls } from './scene.js';
import { initGrids } from './grid.js';
import { loadPointCloud } from './pointCloudLoader.js';
import { animate } from './animation.js';

import { overlayData } from './overlayData.js';
import { addNote, addProjectCard, addProfileImage, addSectionPanel } from './overlayRenderer.js';

// --- Constants for layout calculation ---
const PROJECT_CARD_WIDTH = 300; // As defined in styles.css
const PROJECT_CARD_HEIGHT = 280; // Estimated height (image + text + padding)
const NOTE_WIDTH = 200;          // Default from styles.css
const NOTE_HEIGHT = 88;          // Estimated from styles.css (padding + font size)
const PANEL_MARGIN = 40;         // The desired margin

// ───────────────────────────── Overlay setup ──────────────────────────────
const overlay   = document.getElementById('overlay');
const viewport  = document.getElementById('overlay-viewport');
const viewState = {
  works: { tx: 0, ty: 0, scale: 1 },
  about: { tx: 0, ty: 0, scale: 1 }
};

let currentSection = 'home';   // 'home' | 'works' | 'about'
let isPanning      = false;
let startX = 0, startY = 0;
let tx = 0, ty = 0, scale = 1;

// ---- Unified event handlers for Pan & Zoom ----------------------------

// Helper to get the correct coordinates from either a mouse or touch event
function getEventCoords(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function handlePanStart(e) {
  e.preventDefault();
  isPanning = true;
  viewport.style.cursor = 'grabbing';
  const coords = getEventCoords(e);
  startX = coords.x;
  startY = coords.y;
}

function handlePanMove(e) {
  if (!isPanning) return;
  e.preventDefault();
  const coords = getEventCoords(e);
  tx += coords.x - startX;
  ty += coords.y - startY;
  startX = coords.x;
  startY = coords.y;
  applyTransform();
}

function handlePanEnd() {
  isPanning = false;
  viewport.style.cursor = 'grab';
}

// ---- Attach Listeners ----------------------------------------------------
// Listen on the full-screen OVERLAY, not just the VIEWPORT
overlay.addEventListener('mousedown', handlePanStart);
window.addEventListener('mousemove', handlePanMove);
window.addEventListener('mouseup', handlePanEnd);
overlay.addEventListener('touchstart', handlePanStart, { passive: false });
window.addEventListener('touchmove', handlePanMove, { passive: false });
window.addEventListener('touchend', handlePanEnd);


// ---- wheel to zoom (focus under cursor) ------------------------------------
// Listen on the full-screen OVERLAY, not just the VIEWPORT
overlay.addEventListener('wheel', e => {
  e.preventDefault();
  const rect      = viewport.getBoundingClientRect();
  const cx        = e.clientX - rect.left;
  const cy        = e.clientY - rect.top;
  const prevScale = scale;
  const factor    = e.deltaY < 0 ? 1.15 : 0.85;
  scale *= factor;

  tx = cx - (cx - tx) * (scale / prevScale);
  ty = cy - (cy - ty) * (scale / prevScale);

  applyTransform();
}, { passive: false });

function applyTransform(updateState = true) {
  viewport.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  if (updateState && (currentSection === 'works' || currentSection === 'about')) {
    Object.assign(viewState[currentSection], { tx, ty, scale });
  }
}

function showOverlay(section) {
  document.body.appendChild(overlay);
  currentSection = section;

  const isMobile = window.innerWidth <= 768;

  // If on mobile, reset the view to the top-left corner (0,0) with a suitable zoom level.
  if (isMobile) {
    if (section === 'works') {
      viewState.works = { tx: 0, ty: 0, scale: 0.4 };
    } else if (section === 'about') {
      viewState.about = { tx: 0, ty: 0, scale: 0.5 };
    }
  }

  const st = viewState[section];
  tx = st.tx; ty = st.ty; scale = st.scale;
  applyTransform(false);

  populateOverlay(section);
  overlay.classList.remove('hidden');
  controls.enabled = false;

  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.filter = 'invert(1)';
  }
}

function hideOverlay() {
  overlay.classList.add('hidden');
  viewport.innerHTML = '';
  controls.enabled = true;
  currentSection = 'home';
  tx = 0; ty = 0; scale = 1;

  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.filter = 'invert(0)';
  }
}

function populateOverlay(section) {
  const data = overlayData[section];
  viewport.innerHTML = '';

  if (section === 'works' && data.sections) {
    data.sections.forEach(sec => {
      if (!sec.projects || sec.projects.length === 0) return;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      const note = sec.note;
      minX = Math.min(minX, note.x);
      minY = Math.min(minY, note.y);
      maxX = Math.max(maxX, note.x + (note.width || NOTE_WIDTH));
      maxY = Math.max(maxY, note.y + NOTE_HEIGHT);

      sec.projects.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x + PROJECT_CARD_WIDTH);
        maxY = Math.max(maxY, p.y + PROJECT_CARD_HEIGHT);
      });

      const panelX = minX - PANEL_MARGIN;
      const panelY = minY - PANEL_MARGIN;
      const panelWidth = (maxX - minX) + (2 * PANEL_MARGIN);
      const panelHeight = (maxY - minY) + (2 * PANEL_MARGIN) - 95;
      
      const positionedNote = {
        ...note,
        y: panelY - (NOTE_HEIGHT / 2) + 65
      };

      addSectionPanel(viewport, { x: panelX, y: panelY, width: panelWidth, height: panelHeight });
      addNote(viewport, positionedNote);
      sec.projects.forEach(project => addProjectCard(viewport, project));
    });
  } else {
    if (data.notes) data.notes.forEach(note => addNote(viewport, note));
    if (data.projects) data.projects.forEach(project => addProjectCard(viewport, project));
    if (data.profileImage) addProfileImage(viewport, data.profileImage);
  }
}

// ───────────────────────────── Three.js setup ──────────────────────────────
initScene();
initGrids();
loadPointCloud();
animate();

// ─────────────────────────── Navigation Logic ──────────────────────────
const nav = document.getElementById('bottom-nav');
const slider = document.getElementById('nav-slider');
const navLinks = document.querySelectorAll('.nav-link');

function updateSlider(activeLink) {
  slider.style.width = `${activeLink.offsetWidth}px`;
  slider.style.left = `${activeLink.offsetLeft}px`;
}

const initialActiveLink = document.querySelector('.nav-link.active');
if (initialActiveLink) {
    setTimeout(() => updateSlider(initialActiveLink), 50);
}

nav.addEventListener('click', (e) => {
  e.preventDefault();
  const clickedLink = e.target.closest('.nav-link');
  if (!clickedLink) return;

  navLinks.forEach(link => link.classList.remove('active'));
  clickedLink.classList.add('active');
  updateSlider(clickedLink);

  const section = clickedLink.dataset.section;

  if (section === 'home') {
    hideOverlay();
    tweenCamera(new THREE.Vector3(0, 0, 1), controls.target.clone());
  } else if (section === 'works') {
    toggleSection('works', new THREE.Vector3(0, 0, 2));
  } else if (section === 'about') {
    toggleSection('about', new THREE.Vector3(-2, 0, 0));
  }
});

function toggleSection(sec, camPos) {
  if (currentSection === sec) {
    hideOverlay();
    const homeLink = document.querySelector('.nav-link[data-section="home"]');
    navLinks.forEach(link => link.classList.remove('active'));
    homeLink.classList.add('active');
    updateSlider(homeLink);
    tweenCamera(new THREE.Vector3(0, 0, 1), controls.target.clone());
  } else {
    showOverlay(sec);
    tweenCamera(camPos, controls.target.clone());
  }
}

// ───────────────────────────── Camera tweening ─────────────────────────────
function tweenCamera(targetPos, targetLookAt, duration = 800) {
  const startPos  = camera.position.clone();
  const startQuat = camera.quaternion.clone();

  camera.position.copy(targetPos);
  camera.lookAt(targetLookAt);
  const targetQuat = camera.quaternion.clone();

  camera.position.copy(startPos);
  camera.quaternion.copy(startQuat);

  let startTime = null;
  function animateCamera(now) {
    if (!startTime) startTime = now;
    const t = Math.min((now - startTime) / duration, 1);

    camera.position.lerpVectors(startPos, targetPos, t);
    camera.quaternion.copy(startQuat).slerp(targetQuat, t);

    if (t < 1) requestAnimationFrame(animateCamera);
  }

  requestAnimationFrame(animateCamera);
}
