/**
 * Color Constants for Abby's Vibe System
 *
 * All colors are defined as normalized RGB (0-1) for direct use in shaders.
 * Hex values in comments for reference.
 */

import { ColorPalette, VibeColorTheme, VibeComplexity, OrbEnergy, ResponseQuality, RGBColor } from '../types/vibe';

/**
 * Convert hex to normalized RGB
 */
const hexToRGB = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

/**
 * Color palettes for each vibe theme
 */
export const VIBE_COLORS: Record<VibeColorTheme, ColorPalette> = {
  // Trust - Calm, Safe, Welcoming
  TRUST: {
    primary: hexToRGB('#3B82F6'),   // Electric Blue
    secondary: hexToRGB('#06B6D4'), // Cyan
  },

  // Passion - Excitement, Match, Celebration
  PASSION: {
    primary: hexToRGB('#E11D48'),   // Rose Red
    secondary: hexToRGB('#F472B6'), // Hot Pink
  },

  // Caution - Working, Processing, Analyzing
  CAUTION: {
    primary: hexToRGB('#F59E0B'),   // Amber
    secondary: hexToRGB('#D97706'), // Burnt Orange
  },

  // Growth - Supportive, Coaching, Advice
  GROWTH: {
    primary: hexToRGB('#10B981'),   // Emerald
    secondary: hexToRGB('#34D399'), // Mint
  },

  // Deep - Introspective, Serious, Vulnerable
  DEEP: {
    primary: hexToRGB('#4C1D95'),   // Violet
    secondary: hexToRGB('#8B5CF6'), // Indigo
  },

  // Alert - Intervention, Warning, Concern
  ALERT: {
    primary: hexToRGB('#374151'),   // Grey 700
    secondary: hexToRGB('#6B7280'), // Grey 500
  },
};

/**
 * Complexity value mapping
 */
export const COMPLEXITY_VALUES = {
  SMOOTHIE: 0.1,
  FLOW: 0.3,
  OCEAN: 0.5,
  STORM: 0.7,
  PAISLEY: 1.0,
} as const;

/**
 * Hex colors for UI elements (buttons, text, etc.)
 */
export const UI_COLORS = {
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textTertiary: 'rgba(255,255,255,0.5)',

  // Glass
  glassBackground: 'rgba(0,0,0,0.3)',
  glassBorder: 'rgba(255,255,255,0.1)',

  // Button
  buttonBorder: 'rgba(255,255,255,0.3)',
  buttonPressed: 'rgba(255,255,255,0.1)',
} as const;

/**
 * Extended color palette with gradient info
 */
export interface GradientPalette extends ColorPalette {
  gradient: {
    angle: number;
  };
}

/**
 * Full vibe gradients with angle info for VibeController
 */
export const VIBE_GRADIENTS: Record<VibeColorTheme, GradientPalette> = {
  TRUST: {
    primary: VIBE_COLORS.TRUST.primary,
    secondary: VIBE_COLORS.TRUST.secondary,
    gradient: { angle: 135 },
  },
  PASSION: {
    primary: VIBE_COLORS.PASSION.primary,
    secondary: VIBE_COLORS.PASSION.secondary,
    gradient: { angle: 45 },
  },
  CAUTION: {
    primary: VIBE_COLORS.CAUTION.primary,
    secondary: VIBE_COLORS.CAUTION.secondary,
    gradient: { angle: 180 },
  },
  GROWTH: {
    primary: VIBE_COLORS.GROWTH.primary,
    secondary: VIBE_COLORS.GROWTH.secondary,
    gradient: { angle: 90 },
  },
  DEEP: {
    primary: VIBE_COLORS.DEEP.primary,
    secondary: VIBE_COLORS.DEEP.secondary,
    gradient: { angle: 225 },
  },
  ALERT: {
    primary: VIBE_COLORS.ALERT.primary,
    secondary: VIBE_COLORS.ALERT.secondary,
    gradient: { angle: 270 },
  },
};

/**
 * Orb energy numeric values for shader uniform
 */
export const ORB_ENERGY_MAP: Record<OrbEnergy, number> = {
  CALM: 0.0,
  ENGAGED: 0.5,
  EXCITED: 1.0,
};

/**
 * Response quality → visual reward mapping
 */
export const RESPONSE_REWARD_MAP: Record<ResponseQuality, {
  complexity: VibeComplexity;
  orbEnergy: OrbEnergy;
}> = {
  BRIEF: {
    complexity: 'FLOW',
    orbEnergy: 'CALM',
  },
  THOUGHTFUL: {
    complexity: 'OCEAN',
    orbEnergy: 'ENGAGED',
  },
  PROFOUND: {
    complexity: 'STORM',
    orbEnergy: 'EXCITED',
  },
};

/**
 * Coverage percentage → theme progression
 */
export const getThemeFromCoverage = (percent: number): VibeColorTheme => {
  if (percent < 20) return 'TRUST';      // Getting to know you
  if (percent < 40) return 'DEEP';       // Going deeper
  if (percent < 60) return 'GROWTH';     // Building understanding
  if (percent < 80) return 'CAUTION';    // Almost there
  return 'PASSION';                       // Ready to match
};
