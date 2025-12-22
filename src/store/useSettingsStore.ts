/**
 * Settings Store
 *
 * Manages user preferences including input mode.
 * Persists to AsyncStorage for cross-session persistence.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Input mode types
export type InputMode = 'voice_only' | 'text_only' | 'voice_and_text';

// Valid input modes for runtime validation
const VALID_INPUT_MODES: InputMode[] = ['voice_only', 'text_only', 'voice_and_text'];

// Type guard to validate InputMode
const isValidInputMode = (value: unknown): value is InputMode => {
  return typeof value === 'string' && VALID_INPUT_MODES.includes(value as InputMode);
};

// Settings schema version (increment when schema changes)
const SETTINGS_VERSION = 1;

// Storage key
const SETTINGS_KEY = '@abby/settings';

// Settings store state
interface SettingsStoreState {
  inputMode: InputMode;
  isLoaded: boolean;
}

// Settings store actions
interface SettingsStoreActions {
  setInputMode: (mode: InputMode) => Promise<void>;
  loadSettings: () => Promise<void>;
}

type SettingsStore = SettingsStoreState & SettingsStoreActions;

// Default state
const initialState: SettingsStoreState = {
  inputMode: 'voice_and_text', // Default to both voice and text
  isLoaded: false,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initialState,

  /**
   * Set input mode and persist to storage
   */
  setInputMode: async (mode: InputMode) => {
    set({ inputMode: mode });

    try {
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          inputMode: mode,
          version: 1,
        })
      );
    } catch (error) {
      console.error('[SettingsStore] Failed to save settings:', error);
    }
  },

  /**
   * Load settings from storage on app launch
   */
  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);

      if (stored) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(stored);
        } catch {
          console.warn('[SettingsStore] Corrupted settings data, using defaults');
          set({ isLoaded: true });
          return;
        }

        // Validate parsed data structure
        if (parsed && typeof parsed === 'object' && parsed !== null) {
          const data = parsed as Record<string, unknown>;

          // Check version for future migrations
          if (data.version !== SETTINGS_VERSION) {
            console.warn(`[SettingsStore] Settings version mismatch (${data.version} vs ${SETTINGS_VERSION}), using defaults`);
            set({ isLoaded: true });
            return;
          }

          // Validate and apply inputMode
          if (isValidInputMode(data.inputMode)) {
            set({ inputMode: data.inputMode, isLoaded: true });
          } else {
            console.warn(`[SettingsStore] Invalid inputMode "${data.inputMode}", using default`);
            set({ isLoaded: true });
          }
        } else {
          set({ isLoaded: true });
        }
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('[SettingsStore] Failed to load settings:', error);
      set({ isLoaded: true });
    }
  },
}));

// Selector for input mode
export const useInputMode = () => useSettingsStore((state) => state.inputMode);

// Selector for loaded state
export const useSettingsLoaded = () =>
  useSettingsStore((state) => state.isLoaded);
