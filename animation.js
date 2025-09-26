// animation.js

import * as THREE                                                    from 'three';
import { fade, colorAttr, originalColors, vertexMap, connections1, connections2, instances }
                                                                     from './pointCloudLoader.js';
import { gridBoxes1, gridBoxes2 }                                    from './grid.js';
import { scene, renderScene, controls }            from './scene.js';
import {
  TOTAL_CYCLE_DUR,
  PHASE1_DUR,
  PHASE2_DUR,
  PHASE3_DUR,
  PHASE4_DUR,
  PHASE5_DUR
}                                                                     from './constants.js';

let prevTime = Date.now();

/**
 * The main render loop. Call once (after initScene) to start the RAF loop.
 * It will guard until fade[] is initialized (i.e. until loadPointCloud finishes),
 * then do per-frame fade‐update, color interpolations, box resets, instance updates, etc.
 */
export function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Until fade is non-null (PLY still loading), just render a blank scene.
  if (!fade) {
    renderScene();
    return;
  }

  const now   = Date.now();
  const delta = now - prevTime;
  prevTime    = now;

  // 1) Fade all vertex fade‐values downward (over ~1 second)
  for (let i = 0; i < fade.length; i++) {
    if (fade[i] > 0) {
      fade[i] -= delta / 1000;
      if (fade[i] < 0) fade[i] = 0;
    }
  }

  // 2) Update PLY vertex colors based on fade[] & originalColors
  for (let i = 0; i < fade.length; i++) {
    const f  = fade[i];
    const ci = 3 * i;
    // newColor = original * (1 - f) + white * f
    colorAttr.array[ci]     = originalColors[ci]     * (1 - f) + 1 * f;
    colorAttr.array[ci + 1] = originalColors[ci + 1] * (1 - f) + 1 * f;
    colorAttr.array[ci + 2] = originalColors[ci + 2] * (1 - f) + 1 * f;
  }

  // 3) Reset all grid box colors to default (both grids)
  for (const key in gridBoxes1) {
    const { mesh, defaultColor } = gridBoxes1[key];
    mesh.material.color.setHex(defaultColor);
  }
  for (const key in gridBoxes2) {
    const { mesh, defaultColor } = gridBoxes2[key];
    mesh.material.color.setHex(defaultColor);
  }

  // 4) Loop over all active instances; remove expired ones & update animations
  for (let idx = instances.length - 1; idx >= 0; idx--) {
    const inst    = instances[idx];
    const elapsed = now - inst.startTime;

    // If this instance has run ≥ 1 second, clean up everything & remove it
    if (elapsed >= TOTAL_CYCLE_DUR) {
      inst.activeLines1.forEach(({ line }) => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      });
      inst.activeLines2.forEach(({ line }) => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      });
      instances.splice(idx, 1);
      continue;
    }

    // Phase 1: 0 ≤ elapsed < PHASE1_DUR (highlight gridBoxes2)
    if (elapsed < PHASE1_DUR) {
      inst.activeBoxes2.forEach((key) => {
        const { mesh, highlightColor } = gridBoxes2[key];
        mesh.material.color.setHex(highlightColor);
      });
      inst.activeLines2.forEach(({ line }) => (line.visible = false));
      inst.activeLines1.forEach(({ line }) => (line.visible = false));
      continue;
    }

    // Phase 2: PHASE1_DUR ≤ elapsed < PHASE1_DUR + PHASE2_DUR
    // → animate lines2 backward
    if (elapsed < PHASE1_DUR + PHASE2_DUR) {
      const t2 = (elapsed - PHASE1_DUR) / PHASE2_DUR; // 0 → 1 over 300ms
      inst.activeLines2.forEach(({ line, totalPts }) => {
        line.visible = true;
        const maxIdx = totalPts - 2;
        let raw   = (1 - t2) * (totalPts - 1);
        let s     = Math.floor(raw);
        if (s > maxIdx) s = maxIdx;
        if (s < 0)     s = 0;
        // Draw exactly 2 vertices starting at s → one segment
        line.geometry.setDrawRange(s, 2);
      });
      inst.activeLines1.forEach(({ line }) => (line.visible = false));
      continue;
    }

    // Phase 3: PHASE1_DUR + PHASE2_DUR ≤ elapsed < PHASE1_DUR + PHASE2_DUR + PHASE3_DUR
    // → trigger fade for the uniqueBox cluster
    if (elapsed < PHASE1_DUR + PHASE2_DUR + PHASE3_DUR) {
      const verts = vertexMap.get(inst.abKey);
      if (verts) {
        verts.forEach((vi) => { fade[vi] = 1.0; });
      }
      inst.activeLines2.forEach(({ line }) => (line.visible = false));
      inst.activeLines1.forEach(({ line }) => (line.visible = false));
      continue;
    }

    // Phase 4: PHASE1_DUR + PHASE2_DUR + PHASE3_DUR ≤ elapsed < PHASE1_DUR + PHASE2_DUR + PHASE3_DUR + PHASE4_DUR
    // → animate lines1 forward
    const phase4Start = PHASE1_DUR + PHASE2_DUR + PHASE3_DUR;
    if (elapsed < phase4Start + PHASE4_DUR) {
      const t1 = (elapsed - phase4Start) / PHASE4_DUR; // 0 → 1 over 300ms
      inst.activeLines1.forEach(({ line, totalPts }) => {
        line.visible = true;
        const maxIdx = totalPts - 2;
        let raw   = t1 * (totalPts - 1);
        let s     = Math.floor(raw);
        if (s > maxIdx)  s = maxIdx;
        if (s < 0)      s = 0;
        line.geometry.setDrawRange(s, 2);
      });
      inst.activeLines2.forEach(({ line }) => (line.visible = false));
      continue;
    }

    // Phase 5: elapsed ≥ PHASE1_DUR + PHASE2_DUR + PHASE3_DUR + PHASE4_DUR
    // → highlight gridBoxes1
    inst.activeLines2.forEach(({ line }) => (line.visible = false));
    inst.activeLines1.forEach(({ line }) => (line.visible = false));
    inst.activeBoxes1.forEach((key) => {
      const { mesh, highlightColor } = gridBoxes1[key];
      mesh.material.color.setHex(highlightColor);
    });
  }

  // Tell Three.js to refresh vertex colors after fade interpolation
  colorAttr.needsUpdate = true;

  // Final render with fisheye postprocessing
  renderScene();
}

/**
 * Schedules the next animation instance after a random 300–700ms delay.
 */
export function scheduleNextInstance() {
  const delay = 300 + Math.random() * 400; // 300ms to 700ms
  setTimeout(() => {
    addInstance();
    scheduleNextInstance();
  }, delay);
}

/**
 * Creates and registers a new animation instance:
 *   • Randomly pick an (X, Y, Z) → abKey
 *   • For that abKey, clone all matching connection templates into actual THREE.Line meshes (invisible initially)
 *   • Record which gridBoxes to highlight in phase1 and phase5
 */
export function addInstance() {
  const selectedX = Math.floor(Math.random() * 10);  // 0..9
  const selectedY = Math.floor(Math.random() * 17);  // 0..16
  const selectedZ = Math.floor(Math.random() * 2);   // 0..1
  const abKey     = `${selectedX}_${selectedY}_${selectedZ}`;

  const instance = {
    startTime:    Date.now(),
    abKey,
    activeLines1: [],        // For connections1 (unique → gridBoxes1)
    activeLines2: [],        // For connections2 (unique → gridBoxes2)
    activeBoxes1: new Set(), // gridBoxes1 keys to highlight in phase5
    activeBoxes2: new Set()  // gridBoxes2 keys to highlight in phase1
  };

  // Build all line2 meshes (uniqueBox → gridBoxes2) for this abKey
  for (const conn of connections2) {
    if (conn.abKey !== abKey) continue;
    const geomClone = conn.geometryTemplate.clone();
    const totalPts  = geomClone.attributes.position.count; // e.g. 21 if CURVE_SEGMENTS=20

    // Animate a small 2-vertex window moving backward; start invisible
    geomClone.setDrawRange(0, 0);

    const matLine = new THREE.LineBasicMaterial({ color: 0xf8f8f8 });
    const lineMesh = new THREE.Line(geomClone, matLine);
    lineMesh.visible = false; // only show during phase2

    // Store gbKey so we know which gridBox2 this corresponds to
    lineMesh.userData = { gbKey: conn.gbKey };
    scene.add(lineMesh);

    instance.activeLines2.push({ line: lineMesh, totalPts });
    instance.activeBoxes2.add(conn.gbKey);
  }

  // Build all line1 meshes (uniqueBox → gridBoxes1) for this abKey
  for (const conn of connections1) {
    if (conn.abKey !== abKey) continue;
    const geomClone = conn.geometryTemplate.clone();
    const totalPts  = geomClone.attributes.position.count;

    // Animate a small 2-vertex window moving forward; start invisible
    geomClone.setDrawRange(0, 0);

    const matLine = new THREE.LineBasicMaterial({ color: 0xf8f8f8 });
    const lineMesh = new THREE.Line(geomClone, matLine);
    lineMesh.visible = false; // only show during phase4

    lineMesh.userData = { gbKey: conn.gbKey };
    scene.add(lineMesh);

    instance.activeLines1.push({ line: lineMesh, totalPts });
    instance.activeBoxes1.add(conn.gbKey);
  }

  instances.push(instance);
}
