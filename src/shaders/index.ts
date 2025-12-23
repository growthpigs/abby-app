/**
 * Shader Index - Single source of truth for all shader sources
 *
 * Usage:
 *   import { BACKGROUND_SHADERS, getBackgroundShader } from './shaders';
 *   const shader = getBackgroundShader(5); // Returns vibeMatrix5 shader
 */

// Background shaders (VibeMatrix 1-18)
import { VIBE_MATRIX_SHADER } from './vibeMatrix';
import { VIBE_MATRIX_SHADER as VIBE_MATRIX_1_SHADER } from './vibeMatrix1'; // vibeMatrix1 exports as VIBE_MATRIX_SHADER
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

// Note: Glass/orb shaders remain in their component files (LiquidGlass*.tsx)
// because they have different uniform patterns (audioLevel, colorA, colorB)
// and are pre-compiled at module level. Future refactor could extract them.

/**
 * Background shaders indexed by number (1-18)
 * Used by VibeMatrixAnimated for transitions
 */
export const BACKGROUND_SHADERS: Record<number, string> = {
  0: VIBE_MATRIX_SHADER,  // Default/base shader
  1: VIBE_MATRIX_1_SHADER,
  2: VIBE_MATRIX_2_SHADER,
  3: VIBE_MATRIX_3_SHADER,
  4: VIBE_MATRIX_4_SHADER,
  5: VIBE_MATRIX_5_SHADER,
  6: VIBE_MATRIX_6_SHADER,
  7: VIBE_MATRIX_7_SHADER,
  8: VIBE_MATRIX_8_SHADER,
  9: VIBE_MATRIX_9_SHADER,
  10: VIBE_MATRIX_10_SHADER,
  11: VIBE_MATRIX_11_SHADER,
  12: VIBE_MATRIX_12_SHADER,
  13: VIBE_MATRIX_13_SHADER,
  14: VIBE_MATRIX_14_SHADER,
  15: VIBE_MATRIX_15_SHADER,
  16: VIBE_MATRIX_16_SHADER,
  17: VIBE_MATRIX_17_SHADER,
  18: VIBE_MATRIX_18_SHADER,
};

/**
 * Get background shader by index (1-18)
 * Falls back to base shader if index not found
 */
export function getBackgroundShader(index: number): string {
  return BACKGROUND_SHADERS[index] ?? VIBE_MATRIX_SHADER;
}

/**
 * Shader metadata for UI
 */
export const BACKGROUND_SHADER_INFO: Record<number, { label: string; hint: string }> = {
  1: { label: '1', hint: 'Tie-dye pink' },
  2: { label: '2', hint: 'Fire swirls' },
  3: { label: '3', hint: 'Aurora spirals' },
  4: { label: '4', hint: 'Aerial reef' },
  5: { label: '5', hint: 'Liquid marble' },
  6: { label: '6', hint: 'Kaleidoscope' },
  7: { label: '7', hint: 'Ocean shore' },
  8: { label: '8', hint: 'Deep ocean' },
  9: { label: '9', hint: 'Blob metaballs' },
  10: { label: '10', hint: 'Chromatic bloom' },
  11: { label: '11', hint: 'Coral reef' },
  12: { label: '12', hint: 'Stippled gradient' },
  13: { label: '13', hint: 'Fluid shoreline' },
  14: { label: '14', hint: 'Tidal pools' },
  15: { label: '15', hint: 'Seafoam' },
  16: { label: '16', hint: 'Ink bloom' },
  17: { label: '17', hint: 'Lagoon' },
  18: { label: '18', hint: 'Ocean currents' },
};

export const GLASS_SHADER_INFO: Record<number, { label: string; hint: string }> = {
  0: { label: '-', hint: 'No glass' },
  1: { label: 'G1', hint: 'Flowing amoeba' },
  2: { label: 'G2', hint: 'Contained orb' },
  3: { label: 'G3', hint: 'Orbiting satellites' },
  4: { label: 'G4', hint: 'Abby talking orb' },
  5: { label: 'G5', hint: 'Depth parallax' },
  6: { label: 'G6', hint: 'Wave shells + core' },
  7: { label: 'G7', hint: 'Crashing waves' },
  8: { label: 'G8', hint: 'Spiral nebula' },
  9: { label: 'G9', hint: 'Fluid ribbons' },
  10: { label: 'G10', hint: 'Lava orb' },
};

// Re-export individual shaders for direct import
export {
  VIBE_MATRIX_SHADER,
  VIBE_MATRIX_1_SHADER,
  VIBE_MATRIX_2_SHADER,
  VIBE_MATRIX_3_SHADER,
  VIBE_MATRIX_4_SHADER,
  VIBE_MATRIX_5_SHADER,
  VIBE_MATRIX_6_SHADER,
  VIBE_MATRIX_7_SHADER,
  VIBE_MATRIX_8_SHADER,
  VIBE_MATRIX_9_SHADER,
  VIBE_MATRIX_10_SHADER,
  VIBE_MATRIX_11_SHADER,
  VIBE_MATRIX_12_SHADER,
  VIBE_MATRIX_13_SHADER,
  VIBE_MATRIX_14_SHADER,
  VIBE_MATRIX_15_SHADER,
  VIBE_MATRIX_16_SHADER,
  VIBE_MATRIX_17_SHADER,
  VIBE_MATRIX_18_SHADER,
};
