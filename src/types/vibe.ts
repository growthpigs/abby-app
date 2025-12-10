/**
 * Vibe System Types
 *
 * The Vibe system controls the visual state of Abby's background.
 * It has two axes:
 * - Color Theme: The emotional color palette
 * - Complexity: The texture/turbulence level
 */

/**
 * Color themes mapped to emotional states
 */
export type VibeColorTheme =
  | 'TRUST'    // Blue/Cyan - Onboarding, calm interview
  | 'PASSION'  // Red/Pink - Match reveal, celebration
  | 'CAUTION'  // Orange - Searching, analyzing
  | 'GROWTH'   // Green - Coach mode, chat
  | 'DEEP';    // Violet - Deep questions, intervention

/**
 * Complexity levels mapped to texture intensity
 */
export type VibeComplexity =
  | 'SMOOTHIE' // 0.0-0.2 - Liquid marble, very calm
  | 'FLOW'     // 0.2-0.4 - Gentle currents
  | 'OCEAN'    // 0.4-0.6 - Turbulent ridges
  | 'STORM'    // 0.6-0.8 - Sharp edges, high energy
  | 'PAISLEY'; // 0.8-1.0 - Fractal, crystalline

/**
 * RGB color as normalized floats (0-1) for shader uniforms
 */
export type RGBColor = [number, number, number];

/**
 * Color palette with primary and secondary colors
 */
export interface ColorPalette {
  primary: RGBColor;
  secondary: RGBColor;
}

/**
 * Full vibe state
 */
export interface VibeState {
  colorTheme: VibeColorTheme;
  complexity: VibeComplexity;
}

/**
 * Vibe configuration for shader
 */
export interface VibeConfig {
  colorA: RGBColor;
  colorB: RGBColor;
  complexity: number; // 0.0 - 1.0
}

/**
 * App states that map to vibes
 */
export type AppState =
  | 'ONBOARDING'
  | 'VERIFICATION'
  | 'INTERVIEW_LIGHT'
  | 'INTERVIEW_DEEP'
  | 'INTERVIEW_SPICY'
  | 'PROFILE_COMPLETE'
  | 'SEARCHING'
  | 'MATCH_FOUND'
  | 'COACH'
  | 'INTERVENTION';
