/**
 * AbbyOrb Constants
 *
 * Sizing, timing, and configuration for the Petal Orb.
 */

import { PetalConfig, ParticleConfig } from '../../../types/orb';

/**
 * Orb sizes for each mode
 */
export const ORB_SIZES = {
  center: {
    diameter: 250,
    radius: 125,
  },
  docked: {
    diameter: 120,  // Increased from 80 for better visibility
    radius: 60,
  },
} as const;

/**
 * Position configuration
 */
export const ORB_POSITIONS = {
  center: {
    top: '15%',
    bottom: undefined,
  },
  docked: {
    top: undefined,
    bottom: 60,  // Increased to accommodate larger orb
  },
} as const;

/**
 * Animation timing (ms)
 */
export const ORB_TIMING = {
  // Mode transition
  modeTransition: 800,

  // Breathing animation
  breathingDuration: 3000,
  breathingScale: 1.05,

  // Tap pulse
  tapPulseDuration: 200,
  tapPulseScale: 1.08,
} as const;

/**
 * Motion easing - "Honey, not Water"
 * Heavy, viscous, expensive feeling
 */
export const ORB_EASING = {
  // Bezier for smooth heavy motion
  bezier: [0.25, 0.1, 0.25, 1.0] as const,
} as const;

/**
 * Petal configurations
 * Each petal has different rotation speed and direction for organic motion
 */
export const PETAL_CONFIGS: PetalConfig[] = [
  {
    id: 1,
    rotationDuration: 25000,  // 25s for full rotation
    clockwise: true,
    initialRotation: 0,
    scale: 1.0,
  },
  {
    id: 2,
    rotationDuration: 30000,  // 30s - slightly slower
    clockwise: false,         // counter-clockwise
    initialRotation: 120,     // offset by 120 degrees
    scale: 0.95,
  },
  {
    id: 3,
    rotationDuration: 35000,  // 35s - slowest
    clockwise: true,
    initialRotation: 240,     // offset by 240 degrees
    scale: 0.9,
  },
];

/**
 * Generate particle configurations
 * Random positions around the orb
 */
export const generateParticleConfigs = (count: number = 18): ParticleConfig[] => {
  const particles: ParticleConfig[] = [];

  for (let i = 0; i < count; i++) {
    // Random angle around the orb
    const angle = Math.random() * Math.PI * 2;
    // Distance from center (1.2x to 1.8x orb radius)
    const distance = 1.2 + Math.random() * 0.6;

    particles.push({
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 2 + Math.random() * 4,  // 2-6px
      opacity: 0.3 + Math.random() * 0.4,  // 0.3-0.7
      driftSpeed: 0.5 + Math.random() * 0.5,  // 0.5-1.0
      driftAngle: Math.random() * Math.PI * 2,
    });
  }

  return particles;
};

/**
 * Default particle configs (generated once)
 */
export const PARTICLE_CONFIGS = generateParticleConfigs(18);

/**
 * Blur amounts
 */
export const ORB_BLUR = {
  core: 8,
  petals: 12,
  particles: 2,
} as const;
