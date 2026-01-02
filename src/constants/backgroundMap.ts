/**
 * Background Shader Map
 *
 * Index-based access (0-18) for demo progression (soft → hard vibes).
 * 19 total background shaders, now generated via shader factory.
 */

import { getShaderById, getAllShaders } from '../shaders/factory/registryV2';

export const TOTAL_SHADERS = 19;

/**
 * Get shader source by index (0-18)
 * This is the PRIMARY access method for demo progression
 */
export const getShaderByIndex = (index: number): string => {
  const clamped = Math.max(0, Math.min(index, TOTAL_SHADERS - 1));
  return getShaderById(clamped).source;
};

/**
 * All available background shaders (for precompilation/caching)
 */
export const ALL_BACKGROUND_SHADERS = getAllShaders().map(s => s.source);

/**
 * Default shader for fallback (ID 0 = DOMAIN_WARP)
 */
export const DEFAULT_BACKGROUND_SHADER = getShaderById(0).source;

/**
 * Shader index map for direct access (legacy compatibility)
 */
export const SHADER_INDEX: Record<number, string> = Object.fromEntries(
  getAllShaders().map(s => [s.id, s.source])
);
