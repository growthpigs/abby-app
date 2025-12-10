/**
 * Background Shader Map
 *
 * Two access patterns:
 * 1. Index-based (1-18): For demo progression (soft → hard vibes)
 * 2. Mode-based: For party + mode mapping (deprecated - use index)
 *
 * 18 total background shaders.
 */

import { ActiveParty, ActiveMode, UserMode, AbbyMode } from '../types/vibe';

// Import all shader sources (1-18)
import { VIBE_MATRIX_SHADER } from '../shaders/vibeMatrix';
import { VIBE_MATRIX_SHADER as VIBE_MATRIX_1_SHADER } from '../shaders/vibeMatrix1';
import { VIBE_MATRIX_2_SHADER } from '../shaders/vibeMatrix2';
import { VIBE_MATRIX_3_SHADER } from '../shaders/vibeMatrix3';
import { VIBE_MATRIX_4_SHADER } from '../shaders/vibeMatrix4';
import { VIBE_MATRIX_5_SHADER } from '../shaders/vibeMatrix5';
import { VIBE_MATRIX_6_SHADER } from '../shaders/vibeMatrix6';
import { VIBE_MATRIX_7_SHADER } from '../shaders/vibeMatrix7';
import { VIBE_MATRIX_8_SHADER } from '../shaders/vibeMatrix8';
import { VIBE_MATRIX_9_SHADER } from '../shaders/vibeMatrix9';
import { VIBE_MATRIX_10_SHADER } from '../shaders/vibeMatrix10';
import { VIBE_MATRIX_11_SHADER } from '../shaders/vibeMatrix11';
import { VIBE_MATRIX_12_SHADER } from '../shaders/vibeMatrix12';
import { VIBE_MATRIX_13_SHADER } from '../shaders/vibeMatrix13';
import { VIBE_MATRIX_14_SHADER } from '../shaders/vibeMatrix14';
import { VIBE_MATRIX_15_SHADER } from '../shaders/vibeMatrix15';
import { VIBE_MATRIX_16_SHADER } from '../shaders/vibeMatrix16';
import { VIBE_MATRIX_17_SHADER } from '../shaders/vibeMatrix17';
import { VIBE_MATRIX_18_SHADER } from '../shaders/vibeMatrix18';

/**
 * All shaders indexed 1-18 for progression
 * Index 0 = fallback to VIBE_MATRIX_SHADER (same as 1)
 */
const SHADER_INDEX: Record<number, string> = {
  0: VIBE_MATRIX_SHADER,
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

export const TOTAL_SHADERS = 18;

/**
 * Get shader by index (1-18)
 * This is the PRIMARY access method for demo progression
 */
export const getShaderByIndex = (index: number): string => {
  const clamped = Math.max(1, Math.min(index, TOTAL_SHADERS));
  return SHADER_INDEX[clamped] || VIBE_MATRIX_SHADER;
};

/**
 * ABBY mode → shader mapping
 * These play when Abby is the active party
 */
export const ABBY_BACKGROUND_MAP: Record<AbbyMode, string> = {
  SPEAKING: VIBE_MATRIX_SHADER,     // BG1 - Default, domain-warped organic
  PROCESSING: VIBE_MATRIX_2_SHADER, // BG2 - Warm fire swirls
  ADVISING: VIBE_MATRIX_3_SHADER,   // BG3 - Calm coaching vibe
  REVEALING: VIBE_MATRIX_8_SHADER,  // BG8 - Dramatic reveal
  CELEBRATING: VIBE_MATRIX_6_SHADER, // BG6 - Celebration energy
};

/**
 * USER mode → shader mapping
 * These play when the user is the active party (answering questions)
 */
export const USER_BACKGROUND_MAP: Record<UserMode, string> = {
  LISTENING: VIBE_MATRIX_10_SHADER, // BG10 - Gentle attention
  EMPATHY: VIBE_MATRIX_5_SHADER,    // BG5 - Deep emotional
  CURIOSITY: VIBE_MATRIX_4_SHADER,  // BG13 - Exploratory
  REFLECTION: VIBE_MATRIX_7_SHADER, // BG7 - Thoughtful pause
  EXCITEMENT: VIBE_MATRIX_9_SHADER, // BG15 - High energy
};

/**
 * Get the appropriate shader source for current party + mode
 */
export const getBackgroundShader = (party: ActiveParty, mode: ActiveMode): string => {
  if (party === 'ABBY') {
    return ABBY_BACKGROUND_MAP[mode as AbbyMode] || VIBE_MATRIX_SHADER;
  }
  return USER_BACKGROUND_MAP[mode as UserMode] || VIBE_MATRIX_SHADER;
};

/**
 * All available background shaders (for precompilation/caching)
 */
export const ALL_BACKGROUND_SHADERS = [
  VIBE_MATRIX_SHADER,
  VIBE_MATRIX_2_SHADER,
  VIBE_MATRIX_3_SHADER,
  VIBE_MATRIX_4_SHADER,
  VIBE_MATRIX_5_SHADER,
  VIBE_MATRIX_6_SHADER,
  VIBE_MATRIX_7_SHADER,
  VIBE_MATRIX_8_SHADER,
  VIBE_MATRIX_9_SHADER,
  VIBE_MATRIX_10_SHADER,
];

/**
 * Default shader for fallback
 */
export const DEFAULT_BACKGROUND_SHADER = VIBE_MATRIX_SHADER;
