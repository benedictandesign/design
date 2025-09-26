// grid.js

import * as THREE       from 'three';
import { scene }        from './scene.js';

/**
 * Two containers (dictionaries) to hold all 16×16 grid‐box data.
 *   gridBoxes1: boxes at z = -1
 *   gridBoxes2: boxes at z = +1
 *
 * Each entry is keyed by "i_j" (e.g. "3_5") and contains:
 *   { pos: THREE.Vector3, mesh: THREE.Mesh, defaultColor: 0x…, highlightColor: 0x… }
 */
export const gridBoxes1 = {};
export const gridBoxes2 = {};

/**
 * Call once after initScene() if you want both grids in the scene right away.
 */
export function initGrids() {
  createGrid(gridBoxes1, -1, 0x1a1a1a, 0xffffff);
  createGrid(gridBoxes2,  1, 0x1a1a1a, 0xffffff);
}

/**
 * Creates a 16×16 cluster-aligned grid of square planes at a given Z.
 * Each plane is 0.03×0.03, with random cluster‐level jitter in X/Y and small Z offset.
 *
 * @param {Object} gridBoxes       Reference to either gridBoxes1 or gridBoxes2
 * @param {number} zPos            Base Z position for this entire grid
 * @param {number} defaultColor    Hex color for non-highlighted boxes
 * @param {number} highlightColor  Hex color for highlighted boxes (used during animation phases)
 * @param {number} [zOffsetRange=0.1]  Max random Z jitter inside each cluster
 */
export function createGrid(
  gridBoxes,
  zPos,
  defaultColor,
  highlightColor,
  zOffsetRange = 0.1
) {
  const gridSize     = 16;    // total boxes per side
  const clusterSize  = 4;     // each mini‐cluster is 4×4
  const spacing      = 0.03;  // edge length & separation inside a cluster
  const extraGap     = 0.10;  // “extra gap” between clusters (besides the 0.03 inside)

  // clusterWidth = 4 × 0.03 = 0.12
  const clusterWidth  = clusterSize * spacing;
  // cellSize = clusterWidth + spacing + extraGap = 0.12 + 0.03 + 0.10 = 0.25
  const cellSize      = clusterWidth + spacing + extraGap;
  const clusterCount  = gridSize / clusterSize; // 16 / 4 = 4 clusters per side

  // Center entire arrangement around (0,0)
  const totalSpan     = (clusterCount - 1) * cellSize;  // = 3 × 0.25 = 0.75
  const clusterOffset = totalSpan / 2;                 // = 0.375

  // Jitter range inside each 4×4 cluster (X/Y): (cellSize - clusterWidth) * 0.4
  const jitterMaxXY   = (cellSize - clusterWidth) * 0.4;  // = (0.25 - 0.12) × 0.4 = 0.052

  // 1) Pick random center (x, y) for each 4×4 cluster + random Z offset
  const clusterCenters  = {}; // clusterCenters["ci_cj"] = { x, y }
  const clusterZOffsets = {}; // clusterZOffsets["ci_cj"] = randomZ

  for (let ci = 0; ci < clusterCount; ci++) {
    for (let cj = 0; cj < clusterCount; cj++) {
      const baseX = ci * cellSize - clusterOffset;
      const baseY = cj * cellSize - clusterOffset;
      const randX = (Math.random() * 2 - 1) * jitterMaxXY;
      const randY = (Math.random() * 2 - 1) * jitterMaxXY;
      const randZ = (Math.random() * 2 - 1) * zOffsetRange;

      const key = `${ci}_${cj}`;
      clusterCenters[key]  = { x: baseX + randX, y: baseY + randY };
      clusterZOffsets[key] = randZ;
    }
  }

  // 2) Build each 16×16 plane
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const clusterI = Math.floor(i / clusterSize);
      const clusterJ = Math.floor(j / clusterSize);
      const localI   = i % clusterSize;
      const localJ   = j % clusterSize;
      const clusterKey = `${clusterI}_${clusterJ}`;

      const center   = clusterCenters[clusterKey];
      const offsetX  = (localI - (clusterSize - 1) / 2) * spacing;
      const offsetY  = (localJ - (clusterSize - 1) / 2) * spacing;
      const randomZ  = clusterZOffsets[clusterKey];

      const x = center.x + offsetX;
      const y = center.y + offsetY;
      const z = zPos + randomZ;

      const geom = new THREE.CircleGeometry(spacing / 2, 32); // 32 segments for smoothness
      const mat  = new THREE.MeshBasicMaterial({
        color: defaultColor,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);

      gridBoxes[`${i}_${j}`] = {
        pos:           new THREE.Vector3(x, y, z),
        mesh,
        defaultColor,
        highlightColor
      };
    }
  }
}
