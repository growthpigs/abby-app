/**
 * Shader Registry - Central registry of all VibeMatrix shaders
 *
 * This eliminates the need for 18 separate component files.
 * Each shader has:
 * - id: Unique identifier (1-18)
 * - name: Human-readable name
 * - description: Brief description of the visual effect
 * - source: The GLSL shader source string
 * - fallbackColor: Color to show if shader fails to compile
 *
 * Usage:
 *   import { getShaderById, SHADER_REGISTRY } from './registry';
 *   const shader = getShaderById(5); // Gets LIQUID_MARBLE
 *   <VibeMatrixAnimated shaderSource={shader.source} />
 */

import { VIBE_MATRIX_SHADER } from './vibeMatrix';
import { VIBE_MATRIX_SHADER as VIBE_MATRIX_1_SHADER } from './vibeMatrix1';
import { VIBE_MATRIX_2_SHADER } from './vibeMatrix2';
import { VIBE_MATRIX_3_SHADER } from './vibeMatrix3';
import { VIBE_MATRIX_4_SHADER } from './vibeMatrix4';
import { VIBE_MATRIX_5_SHADER } from './vibeMatrix5';
import { VIBE_MATRIX_6_SHADER } from './vibeMatrix6';
import { VIBE_MATRIX_7_SHADER } from './vibeMatrix7';
import { VIBE_MATRIX_8_SHADER } from './vibeMatrix8';
import { VIBE_MATRIX_9_SHADER } from './vibeMatrix9';
import { VIBE_MATRIX_10_SHADER } from './vibeMatrix10';
import { VIBE_MATRIX_11_SHADER } from './vibeMatrix11';
import { VIBE_MATRIX_12_SHADER } from './vibeMatrix12';
import { VIBE_MATRIX_13_SHADER } from './vibeMatrix13';
import { VIBE_MATRIX_14_SHADER } from './vibeMatrix14';
import { VIBE_MATRIX_15_SHADER } from './vibeMatrix15';
import { VIBE_MATRIX_16_SHADER } from './vibeMatrix16';
import { VIBE_MATRIX_17_SHADER } from './vibeMatrix17';
import { VIBE_MATRIX_18_SHADER } from './vibeMatrix18';

/** Shader entry with metadata */
export interface ShaderEntry {
  id: number;
  name: string;
  description: string;
  source: string;
  fallbackColor: string;
}

/** Valid shader IDs */
export type ShaderId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

/**
 * Central registry of all VibeMatrix shaders
 *
 * Organized by visual category:
 * - 0-1: Base domain warping
 * - 2-3: Fire/Aurora (warm, energetic)
 * - 4-6: Organic (cellular, marble, kaleidoscope)
 * - 7-9: Flow (streams, radial, metaballs)
 * - 10-12: Bloom (chromatic, orbs, stippled)
 * - 13-15: Nebula (breathing, magnetic, crystalline)
 * - 16-18: Nature (ink, cellular, aurora)
 */
export const SHADER_REGISTRY: Record<ShaderId, ShaderEntry> = {
  0: {
    id: 0,
    name: 'DOMAIN_WARP',
    description: 'Base domain warping with fBM - organic flowing patterns',
    source: VIBE_MATRIX_SHADER,
    fallbackColor: '#0a0a1a',
  },
  1: {
    id: 1,
    name: 'DOMAIN_WARP_ENHANCED',
    description: 'Enhanced domain warping with additional complexity',
    source: VIBE_MATRIX_1_SHADER,
    fallbackColor: '#0a0a1a',
  },
  2: {
    id: 2,
    name: 'WARM_FIRE_SWIRLS',
    description: 'Multiple drifting swirl centers with warm colors (reds, oranges, yellows)',
    source: VIBE_MATRIX_2_SHADER,
    fallbackColor: '#1a0a0a',
  },
  3: {
    id: 3,
    name: 'NEON_AURORA_SPIRALS',
    description: 'Vibrant aurora-like spirals with neon colors',
    source: VIBE_MATRIX_3_SHADER,
    fallbackColor: '#0a1a0a',
  },
  4: {
    id: 4,
    name: 'CELLULAR_DREAMS',
    description: 'Organic cellular patterns resembling aerial reef views',
    source: VIBE_MATRIX_4_SHADER,
    fallbackColor: '#0a0a1a',
  },
  5: {
    id: 5,
    name: 'LIQUID_MARBLE',
    description: 'Flowing marble texture with organic veins (navy, gold, cream, rose)',
    source: VIBE_MATRIX_5_SHADER,
    fallbackColor: '#0a0a1a',
  },
  6: {
    id: 6,
    name: 'KALEIDOSCOPE_BLOOM',
    description: 'Kaleidoscopic blooming patterns with radial symmetry',
    source: VIBE_MATRIX_6_SHADER,
    fallbackColor: '#1a0a1a',
  },
  7: {
    id: 7,
    name: 'FLOWING_STREAMS',
    description: 'Ocean shore-inspired flowing stream patterns',
    source: VIBE_MATRIX_7_SHADER,
    fallbackColor: '#0a1a1a',
  },
  8: {
    id: 8,
    name: 'RADIAL_FLOW_FIELD',
    description: 'Deep ocean radial flow field patterns',
    source: VIBE_MATRIX_8_SHADER,
    fallbackColor: '#050510',
  },
  9: {
    id: 9,
    name: 'BLOB_METABALLS',
    description: 'Organic blob metaballs with smooth blending',
    source: VIBE_MATRIX_9_SHADER,
    fallbackColor: '#0a0a1a',
  },
  10: {
    id: 10,
    name: 'CHROMATIC_BLOOM',
    description: 'Chromatic aberration bloom effects',
    source: VIBE_MATRIX_10_SHADER,
    fallbackColor: '#0a0a1a',
  },
  11: {
    id: 11,
    name: 'LAYERED_ORBS',
    description: 'Coral reef-inspired layered orb patterns',
    source: VIBE_MATRIX_11_SHADER,
    fallbackColor: '#0a0a1a',
  },
  12: {
    id: 12,
    name: 'STIPPLED_GRADIENT',
    description: 'Stippled gradient textures with pointillist effect',
    source: VIBE_MATRIX_12_SHADER,
    fallbackColor: '#0a0a1a',
  },
  13: {
    id: 13,
    name: 'BREATHING_NEBULA',
    description: 'Fluid shoreline-inspired breathing nebula',
    source: VIBE_MATRIX_13_SHADER,
    fallbackColor: '#0a0a1a',
  },
  14: {
    id: 14,
    name: 'MAGNETIC_FIELD_LINES',
    description: 'Tidal pool-inspired magnetic field line patterns',
    source: VIBE_MATRIX_14_SHADER,
    fallbackColor: '#0a0a1a',
  },
  15: {
    id: 15,
    name: 'CRYSTALLINE_FACETS',
    description: 'Seafoam crystalline facet patterns',
    source: VIBE_MATRIX_15_SHADER,
    fallbackColor: '#0a0a1a',
  },
  16: {
    id: 16,
    name: 'INK_BLOOM',
    description: 'Ink bloom spreading effect in water',
    source: VIBE_MATRIX_16_SHADER,
    fallbackColor: '#0a0a1a',
  },
  17: {
    id: 17,
    name: 'CELLULAR_MEMBRANE',
    description: 'Lagoon-inspired cellular membrane patterns',
    source: VIBE_MATRIX_17_SHADER,
    fallbackColor: '#0a1a1a',
  },
  18: {
    id: 18,
    name: 'AURORA_CURTAINS',
    description: 'Ocean currents aurora curtain effect',
    source: VIBE_MATRIX_18_SHADER,
    fallbackColor: '#0a0a1a',
  },
};

/**
 * Get shader by numeric ID
 * @param id Shader ID (0-18)
 * @returns ShaderEntry or default (0) if not found
 */
export function getShaderById(id: number): ShaderEntry {
  const shaderId = id as ShaderId;
  return SHADER_REGISTRY[shaderId] ?? SHADER_REGISTRY[0];
}

/**
 * Get shader by name
 * @param name Shader name (e.g., 'LIQUID_MARBLE')
 * @returns ShaderEntry or default (0) if not found
 */
export function getShaderByName(name: string): ShaderEntry {
  const entry = Object.values(SHADER_REGISTRY).find(s => s.name === name);
  return entry ?? SHADER_REGISTRY[0];
}

/**
 * Get all shader entries as array (for listing/selection UI)
 */
export function getAllShaders(): ShaderEntry[] {
  return Object.values(SHADER_REGISTRY);
}

/**
 * Named shader constants for easy reference
 * Usage: SHADERS.LIQUID_MARBLE.source
 */
export const SHADERS = {
  DOMAIN_WARP: SHADER_REGISTRY[0],
  DOMAIN_WARP_ENHANCED: SHADER_REGISTRY[1],
  WARM_FIRE_SWIRLS: SHADER_REGISTRY[2],
  NEON_AURORA_SPIRALS: SHADER_REGISTRY[3],
  CELLULAR_DREAMS: SHADER_REGISTRY[4],
  LIQUID_MARBLE: SHADER_REGISTRY[5],
  KALEIDOSCOPE_BLOOM: SHADER_REGISTRY[6],
  FLOWING_STREAMS: SHADER_REGISTRY[7],
  RADIAL_FLOW_FIELD: SHADER_REGISTRY[8],
  BLOB_METABALLS: SHADER_REGISTRY[9],
  CHROMATIC_BLOOM: SHADER_REGISTRY[10],
  LAYERED_ORBS: SHADER_REGISTRY[11],
  STIPPLED_GRADIENT: SHADER_REGISTRY[12],
  BREATHING_NEBULA: SHADER_REGISTRY[13],
  MAGNETIC_FIELD_LINES: SHADER_REGISTRY[14],
  CRYSTALLINE_FACETS: SHADER_REGISTRY[15],
  INK_BLOOM: SHADER_REGISTRY[16],
  CELLULAR_MEMBRANE: SHADER_REGISTRY[17],
  AURORA_CURTAINS: SHADER_REGISTRY[18],
} as const;

export default SHADER_REGISTRY;
