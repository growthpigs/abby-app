/**
 * Shader Presets - Pre-configured shader settings matching the original 18 shaders
 *
 * These presets reproduce the exact behavior of the original shader files.
 */

import type { ShaderConfig } from './types';

/** Preset 0: Domain Warp - Base organic flowing patterns */
export const DOMAIN_WARP: ShaderConfig = {
  id: 0,
  name: 'DOMAIN_WARP',
  description: 'Base domain warping with fBM - organic flowing patterns',
  fallbackColor: '#0a0a1a',
  noise: 'simplex',
  time: { scale: 0.001 },
  effect: 'domain_warp',
  useUniformColors: true,
  palette: {
    colors: {
      // Uses uniforms u_colorA, u_colorB, u_colorC
    },
  },
};

/** Preset 1: Domain Warp Enhanced - With tie-dye flow */
export const DOMAIN_WARP_ENHANCED: ShaderConfig = {
  id: 1,
  name: 'DOMAIN_WARP_ENHANCED',
  description: 'Enhanced domain warping with tie-dye flow',
  fallbackColor: '#0a0a1a',
  noise: 'simplex',
  time: { scale: 0.001 },
  effect: 'domain_warp_tiedye',
  useUniformColors: true,
  palette: { colors: {} },
};

/** Preset 2: Warm Fire Swirls */
export const WARM_FIRE_SWIRLS: ShaderConfig = {
  id: 2,
  name: 'WARM_FIRE_SWIRLS',
  description: 'Multiple drifting swirl centers with warm colors',
  fallbackColor: '#1a0a0a',
  noise: 'simplex',
  time: { scale: 0.00025 },
  effect: 'multi_swirl',
  palette: {
    colors: {
      COLOR_RED: [0.9, 0.15, 0.1],
      COLOR_ORANGE: [1.0, 0.5, 0.1],
      COLOR_YELLOW: [1.0, 0.85, 0.2],
      COLOR_MAGENTA: [0.85, 0.1, 0.5],
    },
  },
  vignette: { strength: 1.3, smoothness: 0.6, baseBrightness: 0.8, brightnessBoost: 0.2 },
};

/** Preset 3: Neon Aurora Spirals */
export const NEON_AURORA_SPIRALS: ShaderConfig = {
  id: 3,
  name: 'NEON_AURORA_SPIRALS',
  description: 'Vibrant aurora-like spirals with neon colors',
  fallbackColor: '#0a1a0a',
  noise: 'simplex',
  time: { scale: 0.0002 },
  effect: 'aurora_spirals',
  palette: {
    colors: {
      COLOR_PINK: [1.0, 0.2, 0.6],
      COLOR_BLUE: [0.1, 0.4, 1.0],
      COLOR_CYAN: [0.0, 0.9, 0.9],
      COLOR_PURPLE: [0.6, 0.1, 0.9],
    },
  },
  vignette: { strength: 1.4, smoothness: 0.5, baseBrightness: 0.75, brightnessBoost: 0.25 },
};

/** Preset 4: Cellular Dreams (Aerial Reef) */
export const CELLULAR_DREAMS: ShaderConfig = {
  id: 4,
  name: 'CELLULAR_DREAMS',
  description: 'Organic cellular patterns resembling aerial reef views',
  fallbackColor: '#0a0a1a',
  noise: 'hash',
  time: { scale: 0.001 },
  effect: 'cellular',
  palette: {
    colors: {
      TURQUOISE: [0.25, 0.88, 0.82],
      CYAN: [0.18, 0.75, 0.78],
      TEAL_DEEP: [0.08, 0.55, 0.58],
      REEF_DARK: [0.04, 0.25, 0.28],
    },
  },
};

/** Preset 5: Liquid Marble */
export const LIQUID_MARBLE: ShaderConfig = {
  id: 5,
  name: 'LIQUID_MARBLE',
  description: 'Flowing marble texture with organic veins',
  fallbackColor: '#0a0a1a',
  noise: 'simplex',
  time: { scale: 0.00025 },
  effect: 'liquid_marble',
  palette: {
    colors: {
      COLOR_NAVY: [0.08, 0.1, 0.2],
      COLOR_GOLD: [0.85, 0.7, 0.3],
      COLOR_CREAM: [0.95, 0.9, 0.85],
      COLOR_ROSE: [0.8, 0.4, 0.5],
    },
  },
  vignette: { strength: 1.4, smoothness: 0.5, baseBrightness: 0.7, brightnessBoost: 0.3 },
};

/** Preset 6: Kaleidoscope Bloom */
export const KALEIDOSCOPE_BLOOM: ShaderConfig = {
  id: 6,
  name: 'KALEIDOSCOPE_BLOOM',
  description: 'Kaleidoscopic blooming patterns with radial symmetry',
  fallbackColor: '#1a0a1a',
  noise: 'simplex',
  time: { scale: 0.0002 },
  effect: 'kaleidoscope',
  palette: {
    colors: {
      COLOR_FUCHSIA: [1.0, 0.2, 0.6],
      COLOR_VIOLET: [0.6, 0.2, 0.9],
      COLOR_CORAL: [1.0, 0.5, 0.4],
      COLOR_PEACH: [1.0, 0.8, 0.6],
    },
  },
  vignette: { strength: 1.3, smoothness: 0.5, baseBrightness: 0.75, brightnessBoost: 0.25 },
};

/** Preset 7: Flowing Streams (Ocean Shore) */
export const FLOWING_STREAMS: ShaderConfig = {
  id: 7,
  name: 'FLOWING_STREAMS',
  description: 'Ocean shore-inspired flowing stream patterns',
  fallbackColor: '#0a1a1a',
  noise: 'hash',
  time: { scale: 0.001 },
  effect: 'flowing_streams',
  palette: {
    colors: {
      DEEP_BLUE: [0.15, 0.35, 0.55],
      TURQUOISE: [0.25, 0.75, 0.72],
      LAVENDER: [0.65, 0.58, 0.75],
      SAND: [0.82, 0.72, 0.62],
      FOAM: [0.95, 0.97, 0.98],
    },
  },
};

/** Preset 8: Radial Flow Field */
export const RADIAL_FLOW_FIELD: ShaderConfig = {
  id: 8,
  name: 'RADIAL_FLOW_FIELD',
  description: 'Deep ocean radial flow field patterns',
  fallbackColor: '#050510',
  noise: 'simplex',
  time: { scale: 0.001 },
  effect: 'radial_flow',
  palette: { colors: {} },
};

/** Preset 9: Blob Metaballs */
export const BLOB_METABALLS: ShaderConfig = {
  id: 9,
  name: 'BLOB_METABALLS',
  description: 'Organic blob metaballs with smooth blending',
  fallbackColor: '#0a0a1a',
  noise: 'simplex',
  time: { scale: 0.001 },
  effect: 'metaballs',
  palette: { colors: {} },
};

/** Preset 10: Chromatic Bloom */
export const CHROMATIC_BLOOM: ShaderConfig = {
  id: 10,
  name: 'CHROMATIC_BLOOM',
  description: 'Chromatic aberration bloom effects',
  fallbackColor: '#0a0a1a',
  noise: 'simplex',
  time: { scale: 0.0003 },
  effect: 'chromatic_bloom',
  palette: { colors: {} },
};

/** Preset 11: Layered Orbs */
export const LAYERED_ORBS: ShaderConfig = {
  id: 11,
  name: 'LAYERED_ORBS',
  description: 'Coral reef-inspired layered orb patterns',
  fallbackColor: '#0a0a1a',
  noise: 'simplex',
  time: { scale: 0.001 },
  effect: 'layered_orbs',
  palette: { colors: {} },
};

/** Preset 12: Stippled Gradient */
export const STIPPLED_GRADIENT: ShaderConfig = {
  id: 12,
  name: 'STIPPLED_GRADIENT',
  description: 'Stippled gradient textures with pointillist effect',
  fallbackColor: '#0a0a1a',
  noise: 'hash',
  time: { scale: 0.001 },
  effect: 'stippled',
  palette: { colors: {} },
};

/** Preset 13: Breathing Nebula */
export const BREATHING_NEBULA: ShaderConfig = {
  id: 13,
  name: 'BREATHING_NEBULA',
  description: 'Fluid shoreline-inspired breathing nebula',
  fallbackColor: '#0a0a1a',
  noise: 'both',
  time: { scale: 0.001 },
  effect: 'breathing_nebula',
  palette: { colors: {} },
};

/** Preset 14: Magnetic Field Lines */
export const MAGNETIC_FIELD_LINES: ShaderConfig = {
  id: 14,
  name: 'MAGNETIC_FIELD_LINES',
  description: 'Tidal pool-inspired magnetic field line patterns',
  fallbackColor: '#0a0a1a',
  noise: 'simplex',
  time: { scale: 0.001 },
  effect: 'magnetic_field',
  palette: { colors: {} },
};

/** Preset 15: Crystalline Facets (Seafoam) */
export const CRYSTALLINE_FACETS: ShaderConfig = {
  id: 15,
  name: 'CRYSTALLINE_FACETS',
  description: 'Seafoam crystalline facet patterns',
  fallbackColor: '#0a0a1a',
  noise: 'hash',
  time: { scale: 0.001 },
  effect: 'crystalline',
  palette: { colors: {} },
};

/** Preset 16: Ink Bloom */
export const INK_BLOOM: ShaderConfig = {
  id: 16,
  name: 'INK_BLOOM',
  description: 'Ink bloom spreading effect in water',
  fallbackColor: '#0a0a1a',
  noise: 'both',
  time: { scale: 0.001 },
  effect: 'ink_bloom',
  palette: { colors: {} },
};

/** Preset 17: Cellular Membrane */
export const CELLULAR_MEMBRANE: ShaderConfig = {
  id: 17,
  name: 'CELLULAR_MEMBRANE',
  description: 'Lagoon-inspired cellular membrane patterns',
  fallbackColor: '#0a1a1a',
  noise: 'hash',
  time: { scale: 0.001 },
  effect: 'cellular_membrane',
  palette: { colors: {} },
};

/** Preset 18: Aurora Curtains */
export const AURORA_CURTAINS: ShaderConfig = {
  id: 18,
  name: 'AURORA_CURTAINS',
  description: 'Ocean currents aurora curtain effect',
  fallbackColor: '#0a0a1a',
  noise: 'both',
  time: { scale: 0.001 },
  effect: 'aurora_curtains',
  palette: { colors: {} },
};

/** All presets indexed by ID */
export const SHADER_PRESETS: Record<number, ShaderConfig> = {
  0: DOMAIN_WARP,
  1: DOMAIN_WARP_ENHANCED,
  2: WARM_FIRE_SWIRLS,
  3: NEON_AURORA_SPIRALS,
  4: CELLULAR_DREAMS,
  5: LIQUID_MARBLE,
  6: KALEIDOSCOPE_BLOOM,
  7: FLOWING_STREAMS,
  8: RADIAL_FLOW_FIELD,
  9: BLOB_METABALLS,
  10: CHROMATIC_BLOOM,
  11: LAYERED_ORBS,
  12: STIPPLED_GRADIENT,
  13: BREATHING_NEBULA,
  14: MAGNETIC_FIELD_LINES,
  15: CRYSTALLINE_FACETS,
  16: INK_BLOOM,
  17: CELLULAR_MEMBRANE,
  18: AURORA_CURTAINS,
};

/** Presets by name */
export const PRESETS = {
  DOMAIN_WARP,
  DOMAIN_WARP_ENHANCED,
  WARM_FIRE_SWIRLS,
  NEON_AURORA_SPIRALS,
  CELLULAR_DREAMS,
  LIQUID_MARBLE,
  KALEIDOSCOPE_BLOOM,
  FLOWING_STREAMS,
  RADIAL_FLOW_FIELD,
  BLOB_METABALLS,
  CHROMATIC_BLOOM,
  LAYERED_ORBS,
  STIPPLED_GRADIENT,
  BREATHING_NEBULA,
  MAGNETIC_FIELD_LINES,
  CRYSTALLINE_FACETS,
  INK_BLOOM,
  CELLULAR_MEMBRANE,
  AURORA_CURTAINS,
} as const;
