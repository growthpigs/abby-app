/**
 * Onboarding Store
 *
 * Manages user onboarding data collected during the basics flow.
 * Updated to match client spec with all 11 screens.
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

// Onboarding store state (matches client spec screens 4-11)
interface OnboardingStoreState {
  // Screen 4: Name
  fullName: string | null;
  nickname: string | null;

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
}

// Onboarding store actions
interface OnboardingStoreActions {
  // Screen 4
  setFullName: (name: string) => void;
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
}

type OnboardingStore = OnboardingStoreState & OnboardingStoreActions;

// Default state
const initialState: OnboardingStoreState = {
  // Screen 4
  fullName: null,
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
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  // Screen 4: Name
  setFullName: (name: string) => {
    set({ fullName: name });
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
   * Maps internal state to PUT /user/profile request body
   */
  getProfilePayload: () => {
    const state = get();
    const payload: Record<string, unknown> = {};

    // Screen 4: Name
    if (state.fullName) {
      payload.fullName = state.fullName;
    }
    if (state.nickname) {
      payload.nickname = state.nickname;
      payload.displayName = state.nickname; // Also set as display name
    }

    // Screen 5: DOB & Age Range
    if (state.dateOfBirth) {
      payload.dateOfBirth = state.dateOfBirth.toISOString().split('T')[0];
    }
    payload.ageRangeMin = state.ageRangeMin;
    payload.ageRangeMax = state.ageRangeMax;

    // Screen 6: Gender
    if (state.gender) {
      payload.gender = state.gender;
    }

    // Screen 7: Dating Preference
    if (state.datingPreference) {
      // Map preference to array format for API
      if (state.datingPreference === 'everyone') {
        payload.seekingGenders = ['man', 'woman', 'non_binary'];
      } else if (state.datingPreference === 'men') {
        payload.seekingGenders = ['man'];
      } else if (state.datingPreference === 'women') {
        payload.seekingGenders = ['woman'];
      } else {
        payload.seekingGenders = [state.datingPreference];
      }
    }

    // Screen 8: Ethnicity
    if (state.ethnicity) {
      payload.ethnicity = state.ethnicity;
    }

    // Screen 9: Ethnicity Preferences
    if (state.ethnicityPreferences.length > 0) {
      payload.ethnicityPreferences = state.ethnicityPreferences;
    }

    // Screen 10: Relationship Type
    if (state.relationshipType) {
      payload.relationshipType = state.relationshipType;
    }

    // Screen 11: Smoking
    if (state.smokingMe) {
      payload.smokingMe = state.smokingMe;
    }
    if (state.smokingPartner) {
      payload.smokingPartner = state.smokingPartner;
    }

    // Location
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
export const useOnboardingFullName = () =>
  useOnboardingStore((state) => state.fullName);

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
