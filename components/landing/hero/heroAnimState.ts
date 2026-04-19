export type HeroAnimState = {
  cameraZ: number
  cameraY: number
  globeRotY: number
  globeRotX: number
  globeScale: number
  autoRotateSpeed: number
  markerOpacity: number
  cascadeOpacity: number
  motionBlur: number
}

export const DEFAULT_FINAL_STATE: HeroAnimState = {
  cameraZ: 3.9,
  cameraY: 0.15,
  globeRotY: 0,
  globeRotX: 0,
  globeScale: 1,
  autoRotateSpeed: 0.05,
  markerOpacity: 1,
  cascadeOpacity: 1,
  motionBlur: 0,
}

// Phase 1 starting state — zoomed in on Strait of Hormuz (~26.5°N, 56.2°E)
// Globe is rotated so Hormuz is centered, tilted slightly forward to mimic
// a "looking down at ~60° angle" near-surface view. Scale magnifies the region.
// Derived constants (computed empirically to center Hormuz on camera):
//   rotY brings longitude 56.2°E toward the camera face
//   rotX tilts the globe forward to simulate downward look
export const PHASE1_START_STATE: HeroAnimState = {
  cameraZ: 1.35,
  cameraY: 0.0,
  globeRotY: -0.98, // rotate so ~56°E faces the camera
  globeRotX: 0.45,
  globeScale: 2.9,
  autoRotateSpeed: 0,
  markerOpacity: 0,
  cascadeOpacity: 0,
  motionBlur: 0,
}
