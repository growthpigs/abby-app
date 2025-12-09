/**
 * AbbyOrb Types
 *
 * Types for the Petal Orb component - Layer 1 of the Glass Sandwich.
 * Abby is always visible, transforming between center and docked modes.
 */

import { RGBColor } from './vibe';

/**
 * Orb display mode
 * - center: Large (250px), top: 15%, expressing/speaking
 * - docked: Small (80px), bottom: 40px, waiting for user
 */
export type OrbMode = 'center' | 'docked';

/**
 * Orb sizing constants
 */
export interface OrbSize {
  diameter: number;
  radius: number;
}

/**
 * Orb color configuration derived from vibe store
 */
export interface OrbColors {
  // Core sphere colors
  core: {
    highlight: string;  // Bright center glow (white/yellow)
    inner: string;      // Warm inner color (peach/orange)
    outer: string;      // Fades to edge
  };
  // Petal gradient colors (warm to cool transition)
  petals: {
    warm: string;       // Inner petal color
    cool: string;       // Outer petal color
  };
  // Particle color
  particles: string;
}

/**
 * Petal configuration
 */
export interface PetalConfig {
  id: number;
  rotationDuration: number;  // ms for full rotation
  clockwise: boolean;
  initialRotation: number;   // degrees offset
  scale: number;             // relative size
}

/**
 * Particle configuration
 */
export interface ParticleConfig {
  id: number;
  x: number;            // relative position (-1 to 1)
  y: number;
  size: number;         // px
  opacity: number;      // 0-1
  driftSpeed: number;   // animation speed multiplier
  driftAngle: number;   // direction of drift (radians)
}

/**
 * Props for AbbyOrb main component
 */
export interface AbbyOrbProps {
  mode: OrbMode;
  onTap?: () => void;
}

/**
 * Props for OrbCore2D
 */
export interface OrbCore2DProps {
  size: number;
  colors: OrbColors;
  breathing?: boolean;
}

/**
 * Props for OrbPetals
 */
export interface OrbPetalsProps {
  size: number;
  colors: OrbColors;
  visible: boolean;
}

/**
 * Props for OrbParticles
 */
export interface OrbParticlesProps {
  orbSize: number;
  color: string;
  visible: boolean;
}
