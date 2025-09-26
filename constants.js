// constants.js

// Timing parameters (all in milliseconds)
export const TOTAL_CYCLE_DUR = 1000;  // 1 second total
export const PHASE1_DUR     = 100;   // 0–100ms: highlight gridBoxes2
export const PHASE2_DUR     = 300;   // 100–400ms: animate lines2
export const PHASE3_DUR     = 100;   // 400–500ms: trigger fade
export const PHASE4_DUR     = 300;   // 500–800ms: animate lines1
export const PHASE5_DUR     = 200;   // 800–1000ms: highlight gridBoxes1

// Probability of creating a line between a uniqueBox and a gridBox
export const LINE_PROBABILITY = 0.2;

// When building Bezier curves
export const SAG_AMOUNT     = 0.15;  // sag in Z for the midpoint
export const CURVE_SEGMENTS = 20;    // how many points per curve