/**
 * Vibe → Shader Mapping
 *
 * Maps emotional themes (vibe_shift) to appropriate shader textures.
 * This creates visual cohesion between color palette and texture during interview.
 *
 * Design principle: Each vibe has 3-4 shaders that match its emotional character.
 * The selection within a group can be randomized or cycled for variety.
 */

import { VibeColorTheme } from '../types/vibe';
import { ShaderId } from '../shaders/factory/registryV2';

/**
 * Shader groups organized by emotional character
 *
 * TRUST (Blue): Safe, calm, flowing
 * DEEP (Violet): Intimate, cellular, organic
 * PASSION (Red/Pink): Intense, blooming, energetic
 * GROWTH (Green): Nurturing, layered, aurora
 * CAUTION (Orange): Analytical, structured, magnetic
 * ALERT (Grey): Warning, stark, stippled
 */
export const VIBE_SHADER_GROUPS: Record<VibeColorTheme, ShaderId[]> = {
  TRUST: [0, 5, 7],      // Domain Warp, Liquid Marble, Flowing Streams
  DEEP: [4, 13, 17],     // Cellular Dreams, Breathing Nebula, Cellular Membrane
  PASSION: [2, 10, 16],  // Warm Fire Swirls, Chromatic Bloom, Ink Bloom
  GROWTH: [7, 11, 18],   // Flowing Streams, Layered Orbs, Aurora Curtains
  CAUTION: [8, 14, 15],  // Radial Flow Field, Magnetic Field Lines, Crystalline Facets
  ALERT: [9, 12, 3],     // Blob Metaballs, Stippled Gradient, Neon Aurora Spirals
};

/**
 * Get a shader ID for a given vibe theme
 *
 * @param theme - The emotional vibe theme
 * @param index - Optional index to select specific shader in group (defaults to random)
 * @returns A shader ID appropriate for the emotional context
 */
export function getShaderForVibe(theme: VibeColorTheme, index?: number): ShaderId {
  const group = VIBE_SHADER_GROUPS[theme];
  if (!group || group.length === 0) {
    return 0; // Fallback to domain warp
  }

  if (index !== undefined) {
    // Use modulo to cycle through group
    // Math.abs handles negative indices (defensive, shouldn't happen in practice)
    const safeIndex = Math.abs(index) % group.length;
    return group[safeIndex];
  }

  // Random selection from group
  return group[Math.floor(Math.random() * group.length)];
}

/**
 * Get the next shader in a vibe's group (for sequential cycling)
 *
 * @param theme - The emotional vibe theme
 * @param currentShaderId - The current shader ID
 * @returns Next shader ID in the group, wrapping around
 */
export function getNextShaderInVibeGroup(
  theme: VibeColorTheme,
  currentShaderId: ShaderId
): ShaderId {
  const group = VIBE_SHADER_GROUPS[theme];
  if (!group || group.length === 0) return 0;

  const currentIndex = group.indexOf(currentShaderId);
  if (currentIndex === -1) {
    // Current shader not in group, start at beginning
    return group[0];
  }

  // Move to next, wrap around
  const nextIndex = (currentIndex + 1) % group.length;
  return group[nextIndex];
}

/**
 * Default shader for each vibe (first in group)
 */
export const DEFAULT_VIBE_SHADERS: Record<VibeColorTheme, ShaderId> = {
  TRUST: 0,    // Domain Warp - the classic calm
  DEEP: 13,    // Breathing Nebula - intimate depth
  PASSION: 2,  // Warm Fire Swirls - intense energy
  GROWTH: 18,  // Aurora Curtains - nurturing flow
  CAUTION: 14, // Magnetic Field Lines - analytical structure
  ALERT: 9,    // Blob Metaballs - attention-grabbing
};

export default VIBE_SHADER_GROUPS;
