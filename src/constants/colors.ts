/**
 * Color Constants for Abby's Vibe System
 *
 * All colors are defined as normalized RGB (0-1) for direct use in shaders.
 * Hex values in comments for reference.
 */

import { ColorPalette, VibeColorTheme } from '../types/vibe';

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

  // Deep - Introspective, Serious, Warning
  DEEP: {
    primary: hexToRGB('#4C1D95'),   // Violet
    secondary: hexToRGB('#8B5CF6'), // Indigo
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
