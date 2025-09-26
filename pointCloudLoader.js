// pointCloudLoader.js

import * as THREE             from 'three';
import { PLYLoader }          from 'three/examples/jsm/loaders/PLYLoader.js';
import { scene }              from './scene.js';
import { gridBoxes1, gridBoxes2 } from './grid.js';
import {
  LINE_PROBABILITY,
  SAG_AMOUNT,
  CURVE_SEGMENTS
}                              from './constants.js';
import { scheduleNextInstance } from './animation.js';

/**
 * After parsing the PLY, these arrays hold each vertex's x_idx, y_idx, z_idx
 * (custom properties encoded in the PLY header). We export them so that
 * animation.js can read/write the fade array and vertexMap.
 */
export let xIdxArr = null;
export let yIdxArr = null;
export let zIdxArr = null;

/**
 * We store the original PLY vertex colors (Float32Array of length 3×vertexCount),
 * so we can interpolate to/from white. Also we keep a fade[] array per-vertex.
 */
export let originalColors = null;   // Float32Array
export let colorAttr       = null;  // THREE.BufferAttribute on geometry
export let fade            = null;  // Float32Array of length = vertexCount

/**
 * Maps "x_y_z" → [vertexIndex, vertexIndex, ...]
 * Whenever we need to fade a cluster, we look up vertexMap.get("3_5_1"), then
 * set fade[i] = 1 for all those i's.
 */
export const vertexMap = new Map();

/**
 * Connection templates (cloned when animating):
 *   connections1: from each uniqueBox → gridBoxes1
 *   connections2: from each uniqueBox → gridBoxes2
 * Each entry is an object:
 *   { abKey: "x_y_z", gbKey: "i_j", geometryTemplate: THREE.BufferGeometry }
 */
export const connections1 = [];
export const connections2 = [];

/**
 * Active animation “instances.” Each instance is an object that looks like:
 *   {
 *     startTime:   <Date.now() when created>,
 *     abKey:       "x_y_z",
 *     activeLines1: [ { line: THREE.Line, totalPts: <N> }, … ],
 *     activeLines2: [ { line: THREE.Line, totalPts: <N> }, … ],
 *     activeBoxes1: Set("i_j", …),    // keys into gridBoxes1 to highlight
 *     activeBoxes2: Set("i_j", …)     // keys into gridBoxes2 to highlight
 *   }
 */
export const instances = [];

/**
 * Load the PLY point cloud in two stages:
 *   1) Fetch raw PLY text to manually parse x_idx/y_idx/z_idx per-vertex.
 *   2) Use PLYLoader to load the geometry (positions + vertex colors).
 * Then build the uniqueBoxes centroids, build connection templates,
 * and finally kick off the animation scheduling.
 */
export async function loadPointCloud() {
  // --- 1) Fetch raw PLY text to extract “x_idx y_idx z_idx” ---
  const plyText = await fetch('./assets/pointcloud/mri_cleaned_2.ply')
    .then(r => r.text());
  const lines = plyText.split('\n');

  let headerEnd   = 0;
  let vertexCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('element vertex')) {
      vertexCount = +lines[i].split(' ')[2];
    }
    if (lines[i].trim() === 'end_header') {
      headerEnd = i;
      break;
    }
  }

  // Allocate arrays for each PLY vertex's x_idx, y_idx, z_idx
  xIdxArr = new Float32Array(vertexCount);
  yIdxArr = new Float32Array(vertexCount);
  zIdxArr = new Float32Array(vertexCount);

  // Each vertex line in ASCII PLY: e.g. “… x y z nx ny r g b a y_idx x_idx z_idx …”
  for (let i = 0; i < vertexCount; i++) {
    const v = lines[headerEnd + 1 + i].trim().split(/\s+/);
    // By convention in your PLY: v[6] = y_idx, v[7] = x_idx, v[8] = z_idx
    yIdxArr[i] = +v[6];
    xIdxArr[i] = +v[7];
    zIdxArr[i] = +v[8];
  }

  // --- 2) Use PLYLoader to read positions & vertex colors (and build fade[]) ---
  new PLYLoader().load(
    './assets/pointcloud/mri_cleaned_2.ply',
    (geometry) => {
      geometry.computeVertexNormals(); // if you ever need normals

      // Grab the “color” attribute (Float32Array of length = 3×vertexCount)
      colorAttr      = geometry.attributes.color;
      originalColors = colorAttr.array.slice();
      fade           = new Float32Array(vertexCount); // initially all zeros

      // Attach x_idx, y_idx, z_idx as BufferAttributes so we can reference them if needed
      geometry.setAttribute('x_idx', new THREE.BufferAttribute(xIdxArr, 1));
      geometry.setAttribute('y_idx', new THREE.BufferAttribute(yIdxArr, 1));
      geometry.setAttribute('z_idx', new THREE.BufferAttribute(zIdxArr, 1));

      // Build vertexMap: “x_y_z” → [i, i, i, …]
      for (let i = 0; i < vertexCount; i++) {
        const key = `${Math.round(xIdxArr[i])}_${Math.round(yIdxArr[i])}_${Math.round(zIdxArr[i])}`;
        if (!vertexMap.has(key)) {
          vertexMap.set(key, []);
        }
        vertexMap.get(key).push(i);
      }

      // Create the Points mesh (size = 0.005, using vertexColors)
      const pointMaterial = new THREE.PointsMaterial({
        size: 0.005,
        vertexColors: true
      });
      const points = new THREE.Points(geometry, pointMaterial);
      scene.add(points);

      // --- 3) Compute “uniqueBoxes”: centroid of each (x_idx, y_idx, z_idx) cluster ---
      const boxPoints = {}; // boxPoints["x_y_z"] = [ THREE.Vector3, … ]
      const posArr = geometry.attributes.position.array;
      for (let i = 0; i < vertexCount; i++) {
        const key3 = `${Math.round(xIdxArr[i])}_${Math.round(yIdxArr[i])}_${Math.round(zIdxArr[i])}`;
        if (!boxPoints[key3]) boxPoints[key3] = [];
        boxPoints[key3].push(
          new THREE.Vector3(
            posArr[3 * i],
            posArr[3 * i + 1],
            posArr[3 * i + 2]
          )
        );
      }

      // For each key3, compute min/max, then centroid = (min + max) / 2
      const uniqueBoxes = {};
      for (const k in boxPoints) {
        const pts = boxPoints[k];
        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        pts.forEach((p) => { min.min(p); max.max(p); });
        uniqueBoxes[k] = min.add(max).multiplyScalar(0.5);
      }

      // --- 4) Build “connection templates” for both grids ---
      //   connections1: uniqueBoxes → gridBoxes1
      //   connections2: uniqueBoxes → gridBoxes2
      for (const gbKey in gridBoxes1) {
        const gbData = gridBoxes1[gbKey];
        for (const abKey in uniqueBoxes) {
          if (Math.random() > LINE_PROBABILITY) continue;

          const abPos = uniqueBoxes[abKey].clone();
          const mid   = abPos.clone().lerp(gbData.pos, 0.5);
          mid.z -= SAG_AMOUNT;

          const curve = new THREE.QuadraticBezierCurve3(abPos, mid, gbData.pos);
          const pts   = curve.getPoints(CURVE_SEGMENTS);

          const geomLine = new THREE.BufferGeometry().setFromPoints(pts);
          connections1.push({
            abKey,
            gbKey,
            geometryTemplate: geomLine
          });
        }
      }

      for (const gbKey in gridBoxes2) {
        const gbData = gridBoxes2[gbKey];
        for (const abKey in uniqueBoxes) {
          if (Math.random() > LINE_PROBABILITY) continue;

          const abPos = uniqueBoxes[abKey].clone();
          const mid   = abPos.clone().lerp(gbData.pos, 0.5);
          mid.z -= SAG_AMOUNT;

          const curve = new THREE.QuadraticBezierCurve3(abPos, mid, gbData.pos);
          const pts   = curve.getPoints(CURVE_SEGMENTS);

          const geomLine = new THREE.BufferGeometry().setFromPoints(pts);
          connections2.push({
            abKey,
            gbKey,
            geometryTemplate: geomLine
          });
        }
      }

      // --- 5) Now that we have fade[], originalColors, vertexMap, connections…,
      //         start spawning overlapping animation instances. ---
      scheduleNextInstance();
    },
    (xhr) => {
      console.log(`Loading PLY: ${((xhr.loaded / xhr.total) * 100).toFixed(2)}%`);
    },
    (err) => console.error(err)
  );
}
