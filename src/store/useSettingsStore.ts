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
        const parsed = JSON.parse(stored);
        set({
          inputMode: parsed.inputMode || 'voice_and_text',
          isLoaded: true,
        });
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
