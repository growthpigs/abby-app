/**
 * Color Constants for Abby's Vibe System
 *
 * All colors are defined as normalized RGB (0-1) for direct use in shaders.
 * Hex values in comments for reference.
 *
 * NEW: Gradient palettes with light/dark colors and angle direction
 */

import {
  ColorPalette,
  VibeColorTheme,
  ExtendedColorPalette,
  GradientPalette,
  OrbEnergy,
  VibeComplexity,
  ResponseQuality,
} from '../types/vibe';

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
    primary: hexToRGB('#2563EB'),   // Deeper blue (less saturated)
    secondary: hexToRGB('#0891B2'), // Teal (toned down cyan)
  },

  // Passion - Excitement, Match, Celebration
  PASSION: {
    primary: hexToRGB('#E11D48'),   // Rose Red
    secondary: hexToRGB('#F472B6'), // Hot Pink
  },

  // Caution - Working, Processing, Analyzing
  CAUTION: {
    primary: hexToRGB('#D97706'),   // Burnt Orange (was too bright amber)
    secondary: hexToRGB('#92400E'), // Deep ochre (toned down)
  },

  // Growth - Supportive, Coaching, Advice
  GROWTH: {
    primary: hexToRGB('#059669'),   // Deeper emerald (less saturated)
    secondary: hexToRGB('#0D9488'), // Teal-green (toned down)
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

// ============================================
// NEW: Extended Color System with Gradients
// ============================================

/**
 * Extended color palettes with gradient data
 * Light color at top/corner, dark at bottom/corner
 * Angle determines gradient direction (0=right, 90=down, etc.)
 */
export const VIBE_GRADIENTS: Record<VibeColorTheme, ExtendedColorPalette> = {
  // Trust - Calm, Safe, Welcoming
  // Gradient: Top-right → Bottom-left (315°)
  TRUST: {
    primary: hexToRGB('#2563EB'),   // Deeper blue (less saturated)
    secondary: hexToRGB('#0891B2'), // Teal (toned down cyan)
    gradient: {
      light: hexToRGB('#3B82F6'),   // Medium blue (top, less bright)
      dark: hexToRGB('#1E40AF'),    // Dark blue (bottom)
      angle: 315,
    },
  },

  // Passion - Excitement, Match, Celebration
  // Gradient: Bottom-left → Top-right (45°)
  PASSION: {
    primary: hexToRGB('#E11D48'),   // Rose Red
    secondary: hexToRGB('#F472B6'), // Hot Pink
    gradient: {
      light: hexToRGB('#FB7185'),   // Light pink (top)
      dark: hexToRGB('#9F1239'),    // Dark rose (bottom)
      angle: 45,
    },
  },

  // Caution - Working, Processing, Analyzing
  // Gradient: Top → Bottom (180°)
  CAUTION: {
    primary: hexToRGB('#D97706'),   // Burnt Orange (toned down)
    secondary: hexToRGB('#92400E'), // Deep ochre (toned down)
    gradient: {
      light: hexToRGB('#D97706'),   // Burnt orange (top, less harsh)
      dark: hexToRGB('#78350F'),    // Deep brown-orange (bottom)
      angle: 180,
    },
  },

  // Growth - Supportive, Coaching, Advice
  // Gradient: Bottom → Top (0°)
  GROWTH: {
    primary: hexToRGB('#059669'),   // Deeper emerald (less saturated)
    secondary: hexToRGB('#0D9488'), // Teal-green (toned down)
    gradient: {
      light: hexToRGB('#10B981'),   // Medium emerald (top, less bright)
      dark: hexToRGB('#047857'),    // Dark emerald (bottom)
      angle: 0,
    },
  },

  // Deep - Introspective, Serious, Warning
  // Gradient: Diagonal (135° - varies)
  DEEP: {
    primary: hexToRGB('#4C1D95'),   // Violet
    secondary: hexToRGB('#8B5CF6'), // Indigo
    gradient: {
      light: hexToRGB('#A78BFA'),   // Light violet (top)
      dark: hexToRGB('#4C1D95'),    // Dark purple (bottom)
      angle: 135,
    },
  },
};

/**
 * Orb Energy to Orb Type mapping
 */
export const ORB_ENERGY_MAP: Record<OrbEnergy, 'G1' | 'G2' | 'G4'> = {
  CALM: 'G4',     // Small glow, idle
  ENGAGED: 'G2', // Medium glow, opening up
  EXCITED: 'G1', // Large glow, exceptional
};

/**
 * Response Quality to Visual Reward mapping
 * Returns complexity level and orb energy
 */
export const RESPONSE_REWARD_MAP: Record<ResponseQuality, {
  complexity: VibeComplexity;
  orbEnergy: OrbEnergy;
}> = {
  BORING: { complexity: 'SMOOTHIE', orbEnergy: 'CALM' },
  NORMAL: { complexity: 'FLOW', orbEnergy: 'CALM' },
  ENGAGED: { complexity: 'OCEAN', orbEnergy: 'ENGAGED' },
  THOUGHTFUL: { complexity: 'STORM', orbEnergy: 'ENGAGED' },
  EXCEPTIONAL: { complexity: 'PAISLEY', orbEnergy: 'EXCITED' },
};

/**
 * Coverage % to Color Theme mapping
 * As user fills more data points, vibe progresses through themes
 */
export const COVERAGE_THEME_MAP: Array<{
  threshold: number;
  theme: VibeColorTheme;
  meaning: string;
}> = [
  { threshold: 0, theme: 'TRUST', meaning: 'Getting to know you' },
  { threshold: 20, theme: 'DEEP', meaning: 'Going deeper' },
  { threshold: 40, theme: 'GROWTH', meaning: 'Building understanding' },
  { threshold: 60, theme: 'CAUTION', meaning: 'Almost there' },
  { threshold: 80, theme: 'PASSION', meaning: 'Ready to match' },
];

/**
 * Get color theme based on profile coverage percentage
 */
export const getThemeFromCoverage = (coveragePercent: number): VibeColorTheme => {
  // Find the highest threshold that coverage meets
  for (let i = COVERAGE_THEME_MAP.length - 1; i >= 0; i--) {
    if (coveragePercent >= COVERAGE_THEME_MAP[i].threshold) {
      return COVERAGE_THEME_MAP[i].theme;
    }
  }
  return 'TRUST'; // Default
};
