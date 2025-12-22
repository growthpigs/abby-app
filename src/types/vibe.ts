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
  | 'COACH_INTRO'
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

/**
 * Who is currently active in the conversation
 */
export type ActiveParty = 'USER' | 'ABBY';

/**
 * User modes - what the user is doing
 */
export type UserMode =
  | 'LISTENING'   // User is listening/reading
  | 'EMPATHY'     // Deep emotional question
  | 'CURIOSITY'   // Exploratory question
  | 'REFLECTION'  // Thoughtful pause
  | 'EXCITEMENT'; // High energy moment

/**
 * Abby modes - what Abby is doing
 */
export type AbbyMode =
  | 'SPEAKING'    // Abby is talking
  | 'PROCESSING'  // Thinking/analyzing
  | 'ADVISING'    // Coaching mode
  | 'REVEALING'   // Match reveal
  | 'CELEBRATING'; // Success moment

/**
 * Combined active mode (either user or abby mode)
 */
export type ActiveMode = UserMode | AbbyMode;

/**
 * Orb energy levels - controls orb animation intensity
 */
export type OrbEnergy =
  | 'CALM'     // 0.0 - Slow, contained
  | 'ENGAGED'  // 0.5 - Medium activity
  | 'EXCITED'; // 1.0 - High energy

/**
 * Response quality for visual rewards
 */
export type ResponseQuality =
  | 'BRIEF'      // Short answer
  | 'THOUGHTFUL' // Good answer
  | 'PROFOUND';  // Deep/long answer

/**
 * Full vibe state with all 4 axes
 */
export interface FullVibeState {
  activeParty: ActiveParty;
  activeMode: ActiveMode;
  colorTheme: VibeColorTheme;
  complexity: VibeComplexity;
  orbEnergy: OrbEnergy;
  audioLevel: number;
}
