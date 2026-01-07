/**
 * Vibe Store - Zustand State Management
 *
 * Controls the visual state of Abby's background.
 * Other components subscribe to this store to know
 * what color/complexity to render.
 */

import { create } from 'zustand';
import {
  VibeColorTheme,
  VibeComplexity,
  VibeConfig,
  AppState,
} from '../types/vibe';
import { VIBE_COLORS, COMPLEXITY_VALUES } from '../constants/colors';

interface VibeStore {
  // Current state
  colorTheme: VibeColorTheme;
  complexity: VibeComplexity;

  // Derived config for shader
  config: VibeConfig;

  // Actions
  setColorTheme: (theme: VibeColorTheme) => void;
  setComplexity: (complexity: VibeComplexity) => void;
  setVibe: (theme: VibeColorTheme, complexity: VibeComplexity) => void;
  setFromAppState: (appState: AppState) => void;
}

/**
 * Map app states to vibe configurations
 */
const APP_STATE_VIBES: Record<AppState, { theme: VibeColorTheme; complexity: VibeComplexity }> = {
  COACH_INTRO: { theme: 'GROWTH', complexity: 'SMOOTHIE' },
  ONBOARDING: { theme: 'TRUST', complexity: 'SMOOTHIE' },
  VERIFICATION: { theme: 'TRUST', complexity: 'SMOOTHIE' },
  INTERVIEW_LIGHT: { theme: 'TRUST', complexity: 'FLOW' },
  INTERVIEW_DEEP: { theme: 'DEEP', complexity: 'OCEAN' },
  INTERVIEW_SPICY: { theme: 'PASSION', complexity: 'OCEAN' },
  PROFILE_COMPLETE: { theme: 'PASSION', complexity: 'FLOW' },
  SEARCHING: { theme: 'CAUTION', complexity: 'OCEAN' },
  MATCH_FOUND: { theme: 'PASSION', complexity: 'STORM' },
  COACH: { theme: 'GROWTH', complexity: 'SMOOTHIE' },
  INTERVENTION: { theme: 'DEEP', complexity: 'PAISLEY' },
};

/**
 * Build shader config from theme and complexity
 */
const buildConfig = (
  theme: VibeColorTheme,
  complexity: VibeComplexity
): VibeConfig => {
  const palette = VIBE_COLORS[theme];
  return {
    colorA: palette.primary,
    colorB: palette.secondary,
    complexity: COMPLEXITY_VALUES[complexity],
  };
};

export const useVibeStore = create<VibeStore>((set) => ({
  // Initial state - TRUST blue, SMOOTHIE calm
  colorTheme: 'TRUST',
  complexity: 'SMOOTHIE',
  config: buildConfig('TRUST', 'SMOOTHIE'),

  setColorTheme: (theme) =>
    set((state) => ({
      colorTheme: theme,
      config: buildConfig(theme, state.complexity),
    })),

  setComplexity: (complexity) =>
    set((state) => ({
      complexity,
      config: buildConfig(state.colorTheme, complexity),
    })),

  setVibe: (theme, complexity) =>
    set({
      colorTheme: theme,
      complexity,
      config: buildConfig(theme, complexity),
    }),

  setFromAppState: (appState) => {
    const vibe = APP_STATE_VIBES[appState];
    if (!vibe) {
      if (__DEV__) console.warn('[VibeStore] Unknown app state:', appState);
      return;
    }
    const { theme, complexity } = vibe;
    set({
      colorTheme: theme,
      complexity,
      config: buildConfig(theme, complexity),
    });
  },
}));
