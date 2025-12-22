/**
 * VibeController - The Central Visual State Machine
 *
 * Single source of truth for Abby's 750-state visual system.
 * Controls 4 axes:
 * 1. Active Party (USER/ABBY) + Mode → Selects 1 of 10 backgrounds
 * 2. Color Theme → Emotional tone via gradient colors
 * 3. Complexity → Animation intensity (aka "vibe")
 * 4. Orb Energy → User engagement level (G4/G2/G1)
 *
 * All state changes should trigger smooth animated transitions
 * in the consuming components (VibeMatrixAnimated, AbbyOrbAnimated).
 */

import { create } from 'zustand';
import {
  VibeColorTheme,
  VibeComplexity,
  OrbEnergy,
  ActiveParty,
  ActiveMode,
  UserMode,
  AbbyMode,
  AppState,
  ResponseQuality,
  FullVibeState,
  RGBColor,
} from '../types/vibe';
import {
  VIBE_GRADIENTS,
  COMPLEXITY_VALUES,
  RESPONSE_REWARD_MAP,
  getThemeFromCoverage,
  ORB_ENERGY_MAP,
} from '../constants/colors';

// ============================================
// State Interface
// ============================================

interface VibeControllerState extends FullVibeState {
  // Derived values for shader uniforms
  colorA: RGBColor;
  colorB: RGBColor;
  gradientAngle: number;
  complexityValue: number; // 0.0 - 1.0

  // Coverage tracking (for theme progression)
  coveragePercent: number;

  // Speaking pulse state
  isSpeakingPulseActive: boolean;
}

interface VibeControllerActions {
  // === Party & Mode Control ===
  setActiveParty: (party: ActiveParty) => void;
  setUserMode: (mode: UserMode) => void;
  setAbbyMode: (mode: AbbyMode) => void;

  // === Theme Control ===
  setColorTheme: (theme: VibeColorTheme) => void;
  setCoveragePercent: (percent: number) => void; // Auto-updates theme

  // === Complexity Control ===
  setComplexity: (level: VibeComplexity) => void;

  // === Orb Control ===
  setOrbEnergy: (energy: OrbEnergy) => void;
  setAudioLevel: (level: number) => void;

  // === High-Level Actions ===
  setFromAppState: (state: AppState) => void;
  setFromResponse: (quality: ResponseQuality) => void;
  startSpeakingPulse: () => void;
  stopSpeakingPulse: () => void;

  // === Full State ===
  setFullVibe: (
    party: ActiveParty,
    mode: ActiveMode,
    theme: VibeColorTheme,
    complexity: VibeComplexity,
    orbEnergy: OrbEnergy
  ) => void;
}

type VibeControllerStore = VibeControllerState & VibeControllerActions;

// ============================================
// Helpers
// ============================================

const buildShaderConfig = (theme: VibeColorTheme, complexity: VibeComplexity) => {
  const palette = VIBE_GRADIENTS[theme];
  return {
    colorA: palette.primary,
    colorB: palette.secondary,
    gradientAngle: palette.gradient.angle,
    complexityValue: COMPLEXITY_VALUES[complexity],
  };
};

// ============================================
// App State → Vibe Mapping
// ============================================

const APP_STATE_VIBES: Record<AppState, {
  party: ActiveParty;
  mode: ActiveMode;
  theme: VibeColorTheme;
  complexity: VibeComplexity;
  orbEnergy: OrbEnergy;
}> = {
  COACH_INTRO: {
    party: 'ABBY',
    mode: 'SPEAKING',
    theme: 'GROWTH',
    complexity: 'SMOOTHIE',
    orbEnergy: 'CALM',
  },
  ONBOARDING: {
    party: 'ABBY',
    mode: 'SPEAKING',
    theme: 'TRUST',
    complexity: 'SMOOTHIE',
    orbEnergy: 'CALM',
  },
  VERIFICATION: {
    party: 'ABBY',
    mode: 'PROCESSING',
    theme: 'TRUST',
    complexity: 'SMOOTHIE',
    orbEnergy: 'CALM',
  },
  INTERVIEW_LIGHT: {
    party: 'USER',
    mode: 'LISTENING',
    theme: 'TRUST',
    complexity: 'FLOW',
    orbEnergy: 'CALM',
  },
  INTERVIEW_DEEP: {
    party: 'USER',
    mode: 'EMPATHY',
    theme: 'DEEP',
    complexity: 'OCEAN',
    orbEnergy: 'ENGAGED',
  },
  INTERVIEW_SPICY: {
    party: 'USER',
    mode: 'EXCITEMENT',
    theme: 'PASSION',
    complexity: 'OCEAN',
    orbEnergy: 'ENGAGED',
  },
  PROFILE_COMPLETE: {
    party: 'ABBY',
    mode: 'CELEBRATING',
    theme: 'PASSION',
    complexity: 'STORM',
    orbEnergy: 'EXCITED',
  },
  SEARCHING: {
    party: 'ABBY',
    mode: 'PROCESSING',
    theme: 'CAUTION',
    complexity: 'OCEAN',
    orbEnergy: 'ENGAGED',
  },
  MATCH_FOUND: {
    party: 'ABBY',
    mode: 'REVEALING',
    theme: 'PASSION',
    complexity: 'STORM',
    orbEnergy: 'EXCITED',
  },
  COACH: {
    party: 'ABBY',
    mode: 'ADVISING',
    theme: 'GROWTH',
    complexity: 'SMOOTHIE',
    orbEnergy: 'CALM',
  },
  INTERVENTION: {
    party: 'ABBY',
    mode: 'SPEAKING',
    theme: 'DEEP',
    complexity: 'PAISLEY',
    orbEnergy: 'CALM',
  },
};

// ============================================
// Store
// ============================================

export const useVibeController = create<VibeControllerStore>((set, get) => {
  // Initial state
  const initialTheme: VibeColorTheme = 'TRUST';
  const initialComplexity: VibeComplexity = 'SMOOTHIE';
  const initialConfig = buildShaderConfig(initialTheme, initialComplexity);

  return {
    // Initial 4-axis state
    activeParty: 'ABBY',
    activeMode: 'SPEAKING',
    colorTheme: initialTheme,
    complexity: initialComplexity,
    orbEnergy: 'CALM',
    audioLevel: 0,

    // Derived shader values
    ...initialConfig,

    // Coverage
    coveragePercent: 0,

    // Speaking pulse
    isSpeakingPulseActive: false,

    // === Party & Mode Control ===

    setActiveParty: (party) => {
      const currentMode = get().activeMode;
      // When switching party, set default mode for that party
      const newMode: ActiveMode = party === 'USER' ? 'LISTENING' : 'SPEAKING';
      set({ activeParty: party, activeMode: newMode });
    },

    setUserMode: (mode) => {
      set({ activeParty: 'USER', activeMode: mode });
    },

    setAbbyMode: (mode) => {
      set({ activeParty: 'ABBY', activeMode: mode });
    },

    // === Theme Control ===

    setColorTheme: (theme) => {
      const config = buildShaderConfig(theme, get().complexity);
      set({ colorTheme: theme, ...config });
    },

    setCoveragePercent: (percent) => {
      const newTheme = getThemeFromCoverage(percent);
      const config = buildShaderConfig(newTheme, get().complexity);
      set({
        coveragePercent: percent,
        colorTheme: newTheme,
        ...config,
      });
    },

    // === Complexity Control ===

    setComplexity: (level) => {
      const config = buildShaderConfig(get().colorTheme, level);
      set({ complexity: level, ...config });
    },

    // === Orb Control ===

    setOrbEnergy: (energy) => {
      set({ orbEnergy: energy });
    },

    setAudioLevel: (level) => {
      set({ audioLevel: Math.max(0, Math.min(1, level)) });
    },

    // === High-Level Actions ===

    setFromAppState: (state) => {
      const vibe = APP_STATE_VIBES[state];
      const config = buildShaderConfig(vibe.theme, vibe.complexity);
      set({
        activeParty: vibe.party,
        activeMode: vibe.mode,
        colorTheme: vibe.theme,
        complexity: vibe.complexity,
        orbEnergy: vibe.orbEnergy,
        ...config,
      });
    },

    setFromResponse: (quality) => {
      const reward = RESPONSE_REWARD_MAP[quality];
      const config = buildShaderConfig(get().colorTheme, reward.complexity);
      set({
        complexity: reward.complexity,
        orbEnergy: reward.orbEnergy,
        ...config,
      });
    },

    startSpeakingPulse: () => {
      set({ isSpeakingPulseActive: true });
      // Note: Actual pulse animation handled in component via useEffect
    },

    stopSpeakingPulse: () => {
      set({ isSpeakingPulseActive: false, audioLevel: 0 });
    },

    // === Full State ===

    setFullVibe: (party, mode, theme, complexity, orbEnergy) => {
      const config = buildShaderConfig(theme, complexity);
      set({
        activeParty: party,
        activeMode: mode,
        colorTheme: theme,
        complexity,
        orbEnergy,
        ...config,
      });
    },
  };
});

// ============================================
// Selectors (for optimized subscriptions)
// ============================================

export const useVibeColors = () =>
  useVibeController((state) => ({
    colorA: state.colorA,
    colorB: state.colorB,
    gradientAngle: state.gradientAngle,
  }));

export const useVibeComplexity = () =>
  useVibeController((state) => state.complexityValue);

export const useOrbState = () =>
  useVibeController((state) => ({
    energy: state.orbEnergy,
    audioLevel: state.audioLevel,
    colorA: state.colorA,
    colorB: state.colorB,
  }));

export const useActiveBackground = () =>
  useVibeController((state) => ({
    party: state.activeParty,
    mode: state.activeMode,
  }));

export const useFullVibeState = () =>
  useVibeController((state) => ({
    activeParty: state.activeParty,
    activeMode: state.activeMode,
    colorTheme: state.colorTheme,
    complexity: state.complexity,
    orbEnergy: state.orbEnergy,
    audioLevel: state.audioLevel,
  }));
