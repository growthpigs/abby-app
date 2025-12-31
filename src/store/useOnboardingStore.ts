/**
 * Onboarding Store
 *
 * Manages user onboarding data collected during the basics flow:
 * - Gender identity
 * - Dating preferences
 * - Relationship type
 * - Location
 *
 * Data is held in memory during onboarding, then submitted to
 * /v1/profile/public API on completion.
 */

import { create } from 'zustand';

// Location types
export interface GPSLocation {
  lat: number;
  lng: number;
}

export interface OnboardingLocation {
  type: 'gps' | 'zip';
  value: GPSLocation | string;
}

// Onboarding store state
interface OnboardingStoreState {
  // Basics data
  gender: string | null;
  datingPreference: string | null;
  relationshipType: string | null;
  location: OnboardingLocation | null;

  // Progress tracking
  isComplete: boolean;
}

// Onboarding store actions
interface OnboardingStoreActions {
  setGender: (gender: string) => void;
  setDatingPreference: (preference: string) => void;
  setRelationshipType: (type: string) => void;
  setLocation: (location: OnboardingLocation) => void;
  markComplete: () => void;
  reset: () => void;
  getProfilePayload: () => Record<string, unknown>;
}

type OnboardingStore = OnboardingStoreState & OnboardingStoreActions;

// Default state
const initialState: OnboardingStoreState = {
  gender: null,
  datingPreference: null,
  relationshipType: null,
  location: null,
  isComplete: false,
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  /**
   * Set user's gender identity
   */
  setGender: (gender: string) => {
    set({ gender });
  },

  /**
   * Set dating preference (who they want to date)
   */
  setDatingPreference: (preference: string) => {
    set({ datingPreference: preference });
  },

  /**
   * Set desired relationship type
   */
  setRelationshipType: (type: string) => {
    set({ relationshipType: type });
  },

  /**
   * Set location (GPS or zip code)
   */
  setLocation: (location: OnboardingLocation) => {
    set({ location });
  },

  /**
   * Mark onboarding as complete
   */
  markComplete: () => {
    set({ isComplete: true });
  },

  /**
   * Reset all onboarding data (for starting over)
   */
  reset: () => {
    set(initialState);
  },

  /**
   * Get profile payload for API submission
   * Maps internal state to PUT /user/profile request body
   * See docs/04-technical/API-CONTRACTS.md for schema
   */
  getProfilePayload: () => {
    const state = get();

    const payload: Record<string, unknown> = {};

    // gender: string (e.g., "man", "woman", "non_binary")
    if (state.gender) {
      payload.gender = state.gender;
    }

    // seekingGenders: string[] (API expects array, not single value)
    if (state.datingPreference) {
      // Map our single preference to array format
      // "men" -> ["man"], "women" -> ["woman"], "everyone" -> ["man", "woman", ...]
      if (state.datingPreference === 'everyone') {
        payload.seekingGenders = ['man', 'woman', 'non_binary'];
      } else if (state.datingPreference === 'men') {
        payload.seekingGenders = ['man'];
      } else if (state.datingPreference === 'women') {
        payload.seekingGenders = ['woman'];
      } else {
        // For specific preferences like "non_binary", "transgender"
        payload.seekingGenders = [state.datingPreference];
      }
    }

    // relationshipType: string (e.g., "long_term", "short_term", "friends")
    if (state.relationshipType) {
      payload.relationshipType = state.relationshipType;
    }

    // Location: Not in original API contract, but backend likely expects it
    // Using reasonable field names until we verify with backend team
    if (state.location) {
      if (state.location.type === 'gps') {
        const gps = state.location.value as GPSLocation;
        payload.latitude = gps.lat;
        payload.longitude = gps.lng;
      } else {
        payload.zipCode = state.location.value as string;
      }
    }

    return payload;
  },
}));

// Selectors
export const useOnboardingGender = () =>
  useOnboardingStore((state) => state.gender);

export const useOnboardingPreference = () =>
  useOnboardingStore((state) => state.datingPreference);

export const useOnboardingRelationship = () =>
  useOnboardingStore((state) => state.relationshipType);

export const useOnboardingLocation = () =>
  useOnboardingStore((state) => state.location);

export const useOnboardingComplete = () =>
  useOnboardingStore((state) => state.isComplete);
