/**
 * Vibe System Types
 *
 * The Vibe system controls the visual state of Abby's interface.
 * It has FOUR axes for 750 unique states:
 *
 * 1. Active Party (10 backgrounds): Who is "speaking" - USER or ABBY
 * 2. Color Theme (5 themes): Emotional tone via gradient colors
 * 3. Complexity (5 levels): Animation intensity/turbulence (aka "vibe")
 * 4. Orb Energy (3 levels): User engagement level via orb form
 *
 * Total: 10 × 5 × 5 × 3 = 750 visual states
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

// ============================================
// NEW: 4-Axis Visual System Types
// ============================================

/**
 * Active Party - Who is currently "speaking"
 * Determines which set of 5 backgrounds is available
 */
export type ActiveParty = 'USER' | 'ABBY';

/**
 * Active Mode - The specific mode within each party
 * USER has 5 modes, ABBY has 5 modes = 10 total backgrounds
 */
export type UserMode =
  | 'LISTENING'   // BG-U1: Smooth marble - "I'm absorbing what you said"
  | 'EMPATHY'     // BG-U2: Deep ocean waves - "I feel that"
  | 'CURIOSITY'   // BG-U3: Aurora wisps - "Tell me more"
  | 'REFLECTION'  // BG-U4: Ink bloom - "Let me think about that"
  | 'EXCITEMENT'; // BG-U5: Fire ribbons - "Wow, that's great!"

export type AbbyMode =
  | 'SPEAKING'    // BG-A1: Flowing nebula - Abby is talking (TTS active)
  | 'PROCESSING'  // BG-A2: Metaballs/lava - "Analyzing your profile..."
  | 'ADVISING'    // BG-A3: Tidal pools - Coach mode, giving guidance
  | 'REVEALING'   // BG-A4: Crystal fractals - Showing match info
  | 'CELEBRATING';// BG-A5: Paisley explosion - "You got a match!"

export type ActiveMode = UserMode | AbbyMode;

/**
 * Orb Energy Level - Controls which orb form is displayed
 * Higher energy = more glow tinting on background (reverse chameleon effect)
 */
export type OrbEnergy =
  | 'CALM'     // G4 orb - Small glow, idle state
  | 'ENGAGED'  // G2 orb - Medium glow, user is opening up
  | 'EXCITED'; // G1 orb - Large glow, exceptional moment

/**
 * Response Quality - Used to determine visual reward
 * Maps to Complexity + Orb Energy
 */
export type ResponseQuality =
  | 'BORING'      // SMOOTHIE + CALM
  | 'NORMAL'      // FLOW + CALM
  | 'ENGAGED'     // OCEAN + ENGAGED
  | 'THOUGHTFUL'  // STORM + ENGAGED
  | 'EXCEPTIONAL';// PAISLEY + EXCITED

/**
 * Full 4-axis visual state
 */
export interface FullVibeState {
  activeParty: ActiveParty;
  activeMode: ActiveMode;
  colorTheme: VibeColorTheme;
  complexity: VibeComplexity;
  orbEnergy: OrbEnergy;
  audioLevel: number; // 0.0 - 1.0, from ElevenLabs isSpeaking
}

/**
 * Gradient color palette with light/dark and angle
 */
export interface GradientPalette {
  light: RGBColor;      // Top/corner - lighter shade
  dark: RGBColor;       // Bottom/corner - darker shade
  angle: number;        // Gradient direction in degrees (0-360)
}

/**
 * Extended color palette with gradient support
 */
export interface ExtendedColorPalette extends ColorPalette {
  gradient: GradientPalette;
}
