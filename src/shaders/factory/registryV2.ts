/**
 * Shader Registry V2 - Factory-based shader generation
 *
 * This is the new version of the registry that uses the shader factory
 * to generate shaders from presets. It maintains the same interface
 * as the original registry for backward compatibility.
 *
 * Benefits:
 * - Eliminates ~1,300 lines of duplicated noise code
 * - Single source of truth for noise algorithms
 * - Easier to add new effects
 * - Consistent vignette/post-processing
 * - Type-safe shader configuration
 *
 * Migration:
 *   // Before (original registry)
 *   import { getShaderById, SHADER_REGISTRY } from './registry';
 *
 *   // After (factory-based)
 *   import { getShaderById, SHADER_REGISTRY } from './factory/registryV2';
 */

import { createShader } from './index';
import { SHADER_PRESETS, PRESETS } from './presets';
import type { ShaderConfig } from './types';

/** Shader entry with metadata (same interface as original) */
export interface ShaderEntry {
  id: number;
  name: string;
  description: string;
  source: string;
  fallbackColor: string;
  /** The config used to generate this shader (new in V2) */
  config?: ShaderConfig;
}

/** Valid shader IDs */
export type ShaderId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

// Cache generated shaders
const shaderCache = new Map<number, string>();

/**
 * Generate shader source from preset, with caching
 */
function getShaderSource(id: number): string {
  if (shaderCache.has(id)) {
    return shaderCache.get(id)!;
  }

  const preset = SHADER_PRESETS[id];
  if (!preset) {
    // Fallback to preset 0 if not found
    return getShaderSource(0);
  }

  const source = createShader(preset);
  shaderCache.set(id, source);
  return source;
}

/**
 * Create a ShaderEntry from a preset config
 */
function createEntry(config: ShaderConfig): ShaderEntry {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    fallbackColor: config.fallbackColor,
    source: getShaderSource(config.id),
    config,
  };
}

/**
 * Central registry of all VibeMatrix shaders
 * Generated from factory presets
 */
export const SHADER_REGISTRY: Record<ShaderId, ShaderEntry> = {
  0: createEntry(PRESETS.DOMAIN_WARP),
  1: createEntry(PRESETS.DOMAIN_WARP_ENHANCED),
  2: createEntry(PRESETS.WARM_FIRE_SWIRLS),
  3: createEntry(PRESETS.NEON_AURORA_SPIRALS),
  4: createEntry(PRESETS.CELLULAR_DREAMS),
  5: createEntry(PRESETS.LIQUID_MARBLE),
  6: createEntry(PRESETS.KALEIDOSCOPE_BLOOM),
  7: createEntry(PRESETS.FLOWING_STREAMS),
  8: createEntry(PRESETS.RADIAL_FLOW_FIELD),
  9: createEntry(PRESETS.BLOB_METABALLS),
  10: createEntry(PRESETS.CHROMATIC_BLOOM),
  11: createEntry(PRESETS.LAYERED_ORBS),
  12: createEntry(PRESETS.STIPPLED_GRADIENT),
  13: createEntry(PRESETS.BREATHING_NEBULA),
  14: createEntry(PRESETS.MAGNETIC_FIELD_LINES),
  15: createEntry(PRESETS.CRYSTALLINE_FACETS),
  16: createEntry(PRESETS.INK_BLOOM),
  17: createEntry(PRESETS.CELLULAR_MEMBRANE),
  18: createEntry(PRESETS.AURORA_CURTAINS),
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

/**
 * Create a custom shader from config
 * Useful for creating variations without modifying presets
 */
export function createCustomShader(config: ShaderConfig): ShaderEntry {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    fallbackColor: config.fallbackColor,
    source: createShader(config),
    config,
  };
}

/**
 * Get the underlying config for a shader
 * Useful for creating modified versions
 */
export function getShaderConfig(id: number): ShaderConfig | undefined {
  return SHADER_PRESETS[id];
}

export default SHADER_REGISTRY;

// Re-export factory functions for advanced usage
export { createShader } from './index';
export { SHADER_PRESETS, PRESETS } from './presets';
export type { ShaderConfig } from './types';
