/**
 * Onboarding Store
 *
 * Manages user onboarding data collected during the basics flow.
 * Updated to match client spec with all 11 screens.
 *
 * Persists to AsyncStorage for crash recovery (30-day timeout).
 *
 * Data submission:
 * - Profile fields (display_name, birthday, gender) → PUT /v1/profile/public
 * - All other onboarding data → POST /v1/answers with ONB_001-008 question IDs
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { questionsService } from '../services/QuestionsService';
import { ONBOARDING_QUESTION_IDS } from '../constants/onboardingQuestions';

// Storage key and version
const ONBOARDING_KEY = '@abby/onboarding';
const ONBOARDING_VERSION = 2; // Bumped for screen identifier migration

// Session timeout: 30 days
const ONBOARDING_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Screen identifiers - resilient to screen reordering
 * Using string identifiers instead of indices prevents recovery bugs
 * if screens are added/removed/reordered in future updates.
 */
export const ONBOARDING_SCREENS = [
  'name',           // Screen 4: Name
  'dob',            // Screen 5: DOB
  'gender',         // Screen 6: Gender Identity
  'preference',     // Screen 7: Sexual Preference
  'ethnicity',      // Screen 8: Ethnicity
  'ethnicity_pref', // Screen 9: Ethnicity Preference
  'relationship',   // Screen 10: Relationship Type
  'smoking',        // Screen 11: Smoking
] as const;

export type OnboardingScreenId = typeof ONBOARDING_SCREENS[number];

/**
 * Get screen index from identifier (resilient to reordering)
 * Returns 0 if identifier not found (safe fallback)
 */
export const getScreenIndex = (screenId: OnboardingScreenId | null): number => {
  if (!screenId) return 0;
  const index = ONBOARDING_SCREENS.indexOf(screenId);
  return index >= 0 ? index : 0;
};

/**
 * Get screen identifier from index (for backwards compatibility)
 */
export const getScreenId = (index: number): OnboardingScreenId => {
  if (index < 0 || index >= ONBOARDING_SCREENS.length) {
    return ONBOARDING_SCREENS[0];
  }
  return ONBOARDING_SCREENS[index];
};

// Location types
export interface GPSLocation {
  lat: number;
  lng: number;
}

export interface OnboardingLocation {
  type: 'gps' | 'zip';
  value: GPSLocation | string;
}

// Onboarding store state (matches client spec screens 4-11)
interface OnboardingStoreState {
  // Screen 4: Name
  firstName: string | null;
  familyName: string | null;
  nickname: string | null;  // Display name for profile

  // Screen 5: DOB
  dateOfBirth: Date | null;
  ageRangeMin: number;
  ageRangeMax: number;

  // Screen 6: Gender Identity
  gender: string | null;

  // Screen 7: Sexual Preference
  datingPreference: string | null;

  // Screen 8: Ethnicity
  ethnicity: string | null;

  // Screen 9: Ethnicity Preference
  ethnicityPreferences: string[];

  // Screen 10: Relationship Type
  relationshipType: string | null;

  // Screen 11: Smoking
  smokingMe: string | null;
  smokingPartner: string | null;

  // Location
  location: OnboardingLocation | null;

  // Progress tracking
  isComplete: boolean;
  currentScreenId: OnboardingScreenId | null; // Screen identifier for recovery (resilient to reordering)
  savedAt: number | null; // Timestamp for timeout check
  isLoaded: boolean; // Whether persistence has been loaded
}

// Onboarding store actions
interface OnboardingStoreActions {
  // Screen 4
  setFirstName: (name: string) => void;
  setFamilyName: (name: string) => void;
  setNickname: (name: string) => void;

  // Screen 5
  setDateOfBirth: (date: Date) => void;
  setAgeRange: (min: number, max: number) => void;

  // Screen 6
  setGender: (gender: string) => void;

  // Screen 7
  setDatingPreference: (preference: string) => void;

  // Screen 8
  setEthnicity: (ethnicity: string) => void;

  // Screen 9
  setEthnicityPreferences: (ethnicities: string[]) => void;

  // Screen 10
  setRelationshipType: (type: string) => void;

  // Screen 11
  setSmokingMe: (value: string) => void;
  setSmokingPartner: (value: string) => void;

  // Location
  setLocation: (location: OnboardingLocation) => void;

  // Utility
  markComplete: () => void;
  reset: () => void;
  getProfilePayload: () => Record<string, unknown>;
  submitOnboardingAnswers: () => Promise<{ success: boolean; errors: string[] }>;

  // Persistence
  setCurrentScreen: (screenId: OnboardingScreenId) => void;
  getCurrentScreenIndex: () => number; // Get index from current identifier
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<boolean>; // Returns true if recovered session
  clearStorage: () => Promise<void>;
}

type OnboardingStore = OnboardingStoreState & OnboardingStoreActions;

// Default state
const initialState: OnboardingStoreState = {
  // Screen 4
  firstName: null,
  familyName: null,
  nickname: null,

  // Screen 5
  dateOfBirth: null,
  ageRangeMin: 18,
  ageRangeMax: 65,

  // Screen 6
  gender: null,

  // Screen 7
  datingPreference: null,

  // Screen 8
  ethnicity: null,

  // Screen 9
  ethnicityPreferences: [],

  // Screen 10
  relationshipType: null,

  // Screen 11
  smokingMe: null,
  smokingPartner: null,

  // Location
  location: null,

  // Progress
  isComplete: false,
  currentScreenId: null,
  savedAt: null,
  isLoaded: false,
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  // Screen 4: Name
  setFirstName: (name: string) => {
    set({ firstName: name });
  },

  setFamilyName: (name: string) => {
    set({ familyName: name });
  },

  setNickname: (name: string) => {
    set({ nickname: name });
  },

  // Screen 5: DOB
  setDateOfBirth: (date: Date) => {
    set({ dateOfBirth: date });
  },

  setAgeRange: (min: number, max: number) => {
    set({ ageRangeMin: min, ageRangeMax: max });
  },

  // Screen 6: Gender
  setGender: (gender: string) => {
    set({ gender });
  },

  // Screen 7: Dating Preference
  setDatingPreference: (preference: string) => {
    set({ datingPreference: preference });
  },

  // Screen 8: Ethnicity
  setEthnicity: (ethnicity: string) => {
    set({ ethnicity });
  },

  // Screen 9: Ethnicity Preferences
  setEthnicityPreferences: (ethnicities: string[]) => {
    set({ ethnicityPreferences: ethnicities });
  },

  // Screen 10: Relationship Type
  setRelationshipType: (type: string) => {
    set({ relationshipType: type });
  },

  // Screen 11: Smoking
  setSmokingMe: (value: string) => {
    set({ smokingMe: value });
  },

  setSmokingPartner: (value: string) => {
    set({ smokingPartner: value });
  },

  // Location
  setLocation: (location: OnboardingLocation) => {
    set({ location });
  },

  // Utility
  markComplete: () => {
    set({ isComplete: true });
  },

  reset: () => {
    set(initialState);
  },

  /**
   * Get profile payload for API submission
   * Maps internal state to PUT /v1/profile/public request body
   * Uses snake_case to match API convention
   *
   * IMPORTANT: API /v1/profile/public ONLY accepts these fields:
   *   - display_name, birthday, gender, city, country, interests
   *
   * All other onboarding data (ethnicity, smoking, relationship, location)
   * should be submitted via POST /v1/answers with question IDs ONB_001-008.
   * See: GET /v1/questions/category/onboarding for the question mapping.
   */
  getProfilePayload: () => {
    const state = get();
    const payload: Record<string, unknown> = {};

    // === FIELDS ACCEPTED BY /v1/profile/public ===

    // display_name (with input sanitization)
    if (state.nickname?.trim()) {
      payload.display_name = state.nickname.trim();
    }

    // birthday (YYYY-MM-DD format)
    if (state.dateOfBirth) {
      payload.birthday = state.dateOfBirth.toISOString().split('T')[0];
    }

    // gender (with input sanitization)
    if (state.gender?.trim()) {
      payload.gender = state.gender.trim();
    }

    // === FIELDS REJECTED BY API (DO NOT SEND) ===
    // These must be submitted via POST /v1/answers instead:
    // - ethnicity → ONB_005
    // - ethnicity_preferences → ONB_006
    // - relationship_type → ONB_007
    // - smoking_me, smoking_partner → ONB_008
    // - latitude, longitude, zip_code → location questions

    return payload;
  },

  /**
   * Submit onboarding answers via POST /v1/answers
   *
   * This submits all the onboarding data that can't go to /v1/profile/public:
   * - Dating preference, ethnicity, relationship type, smoking
   *
   * Returns { success: boolean, errors: string[] }
   */
  submitOnboardingAnswers: async () => {
    const state = get();
    const errors: string[] = [];
    let successCount = 0;

    // Build answers array - only include non-null values
    const answers: Array<{ questionId: string; answer: string | string[] }> = [];

    // ONB_004: Dating Preference
    if (state.datingPreference?.trim()) {
      answers.push({
        questionId: ONBOARDING_QUESTION_IDS.DATING_PREFERENCE,
        answer: state.datingPreference.trim(),
      });
    }

    // ONB_005: Ethnicity
    if (state.ethnicity?.trim()) {
      answers.push({
        questionId: ONBOARDING_QUESTION_IDS.ETHNICITY,
        answer: state.ethnicity.trim(),
      });
    }

    // ONB_006: Ethnicity Preferences (multi_select)
    if (state.ethnicityPreferences.length > 0) {
      answers.push({
        questionId: ONBOARDING_QUESTION_IDS.ETHNICITY_PREFERENCES,
        answer: state.ethnicityPreferences,
      });
    }

    // ONB_007: Relationship Type
    if (state.relationshipType?.trim()) {
      answers.push({
        questionId: ONBOARDING_QUESTION_IDS.RELATIONSHIP_TYPE,
        answer: state.relationshipType.trim(),
      });
    }

    // ONB_008: Smoking (combine smokingMe and smokingPartner)
    // The API expects a single answer, so we'll send smokingMe
    if (state.smokingMe?.trim()) {
      answers.push({
        questionId: ONBOARDING_QUESTION_IDS.SMOKING,
        answer: state.smokingMe.trim(),
      });
    }

    // Submit each answer
    for (const ans of answers) {
      try {
        await questionsService.submitAnswer(ans.questionId, ans.answer);
        successCount++;
        if (__DEV__) {
          console.log(`[Onboarding] Submitted answer for ${ans.questionId}`);
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to submit ${ans.questionId}: ${errMsg}`);
        if (__DEV__) {
          console.error(`[Onboarding] Failed to submit ${ans.questionId}:`, error);
        }
      }
    }

    if (__DEV__) {
      console.log(`[Onboarding] Submitted ${successCount}/${answers.length} answers`);
    }

    return {
      success: errors.length === 0,
      errors,
    };
  },

  // Persistence: Set current screen by identifier (resilient to reordering)
  setCurrentScreen: (screenId: OnboardingScreenId) => {
    set({ currentScreenId: screenId });
  },

  // Get current screen index from identifier
  getCurrentScreenIndex: () => {
    const { currentScreenId } = get();
    return getScreenIndex(currentScreenId);
  },

  // Persistence: Save to AsyncStorage
  saveToStorage: async () => {
    try {
      const state = get();
      // Don't save if already complete
      if (state.isComplete) return;

      const toSave = {
        version: ONBOARDING_VERSION,
        savedAt: Date.now(),
        currentScreenId: state.currentScreenId, // Use identifier, not index
        firstName: state.firstName,
        familyName: state.familyName,
        nickname: state.nickname,
        dateOfBirth: state.dateOfBirth?.toISOString() || null,
        ageRangeMin: state.ageRangeMin,
        ageRangeMax: state.ageRangeMax,
        gender: state.gender,
        datingPreference: state.datingPreference,
        ethnicity: state.ethnicity,
        ethnicityPreferences: state.ethnicityPreferences,
        relationshipType: state.relationshipType,
        smokingMe: state.smokingMe,
        smokingPartner: state.smokingPartner,
        location: state.location,
      };

      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(toSave));
      set({ savedAt: toSave.savedAt });
      if (__DEV__) {
        console.log('[OnboardingStore] Saved to storage, screen:', state.currentScreenId);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[OnboardingStore] Failed to save:', error);
      }
    }
  },

  // Persistence: Load from AsyncStorage (returns true if session recovered)
  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!stored) {
        set({ isLoaded: true });
        return false;
      }

      const data = JSON.parse(stored);

      // Version check with migration support
      // Version 1: used currentScreen (index)
      // Version 2: uses currentScreenId (identifier)
      if (data.version !== ONBOARDING_VERSION) {
        // Try to migrate from v1 to v2
        if (data.version === 1 && typeof data.currentScreen === 'number') {
          // Migrate index to identifier
          data.currentScreenId = getScreenId(data.currentScreen);
          data.version = ONBOARDING_VERSION;
          if (__DEV__) {
            console.log('[OnboardingStore] Migrated from v1 to v2, screen index', data.currentScreen, '→', data.currentScreenId);
          }
        } else {
          if (__DEV__) {
            console.warn('[OnboardingStore] Version mismatch, clearing');
          }
          await AsyncStorage.removeItem(ONBOARDING_KEY);
          set({ isLoaded: true });
          return false;
        }
      }

      // Check timeout (30 days)
      if (data.savedAt && Date.now() - data.savedAt > ONBOARDING_TIMEOUT_MS) {
        if (__DEV__) {
          console.log('[OnboardingStore] Session expired, clearing');
        }
        await AsyncStorage.removeItem(ONBOARDING_KEY);
        set({ isLoaded: true });
        return false;
      }

      // Validate screen identifier exists in current screen list
      const screenId = data.currentScreenId;
      const validScreenId = screenId && ONBOARDING_SCREENS.includes(screenId)
        ? screenId
        : null;

      // Restore state
      set({
        isLoaded: true,
        savedAt: data.savedAt,
        currentScreenId: validScreenId,
        firstName: data.firstName || null,
        familyName: data.familyName || null,
        nickname: data.nickname || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        ageRangeMin: data.ageRangeMin ?? 18,
        ageRangeMax: data.ageRangeMax ?? 65,
        gender: data.gender || null,
        datingPreference: data.datingPreference || null,
        ethnicity: data.ethnicity || null,
        ethnicityPreferences: data.ethnicityPreferences || [],
        relationshipType: data.relationshipType || null,
        smokingMe: data.smokingMe || null,
        smokingPartner: data.smokingPartner || null,
        location: data.location || null,
      });

      if (__DEV__) {
        console.log('[OnboardingStore] Recovered session, screen:', validScreenId);
      }
      return true; // Session recovered
    } catch (error) {
      if (__DEV__) {
        console.error('[OnboardingStore] Failed to load:', error);
      }
      set({ isLoaded: true });
      return false;
    }
  },

  // Persistence: Clear storage on completion
  clearStorage: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      if (__DEV__) {
        console.log('[OnboardingStore] Cleared storage');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[OnboardingStore] Failed to clear storage:', error);
      }
    }
  },
}));

// Selectors
export const useOnboardingNickname = () =>
  useOnboardingStore((state) => state.nickname);

export const useOnboardingDOB = () =>
  useOnboardingStore((state) => state.dateOfBirth);

export const useOnboardingAgeRange = () =>
  useOnboardingStore((state) => ({
    min: state.ageRangeMin,
    max: state.ageRangeMax,
  }));

export const useOnboardingGender = () =>
  useOnboardingStore((state) => state.gender);

export const useOnboardingPreference = () =>
  useOnboardingStore((state) => state.datingPreference);

export const useOnboardingEthnicity = () =>
  useOnboardingStore((state) => state.ethnicity);

export const useOnboardingEthnicityPreferences = () =>
  useOnboardingStore((state) => state.ethnicityPreferences);

export const useOnboardingRelationship = () =>
  useOnboardingStore((state) => state.relationshipType);

export const useOnboardingSmoking = () =>
  useOnboardingStore((state) => ({
    me: state.smokingMe,
    partner: state.smokingPartner,
  }));

export const useOnboardingLocation = () =>
  useOnboardingStore((state) => state.location);

export const useOnboardingComplete = () =>
  useOnboardingStore((state) => state.isComplete);
