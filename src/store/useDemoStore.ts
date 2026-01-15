/**
 * Demo State Machine
 *
 * Controls the demo flow through 6 states:
 * ONBOARDING → INTERVIEW → SEARCHING → MATCH → PAYMENT → REVEAL
 *
 * Integrates with VibeController to trigger visual state changes.
 * Persists interview progress to AsyncStorage for crash recovery (7-day timeout).
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VibeColorTheme, AppState } from '../types/vibe';
import { useVibeController } from './useVibeController';
import { ConversationMessage } from '../components/ui/ConversationOverlay';

// Storage key and version
const INTERVIEW_KEY = '@abby/interview';
const INTERVIEW_VERSION = 1;

// Session timeout: 7 days
const INTERVIEW_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000;

// Demo flow states
export type DemoState =
  | 'COACH_INTRO'
  | 'INTERVIEW'
  | 'SEARCHING'
  | 'MATCH'
  | 'PAYMENT'
  | 'REVEAL'
  | 'COACH';

// Question answer structure
export interface Answer {
  questionId: string;
  value: string | number | string[];
  answeredAt: number;
}

// Match profile structure
export interface MatchProfile {
  name: string;
  age: number;
  bio: string;
  photoUrl: string;
  compatibilityScore: number;
}

// Demo store state
interface DemoStoreState {
  currentState: DemoState;
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: Answer[];
  coveragePercent: number;
  matchData: MatchProfile | null;
  userName: string;
  messages: ConversationMessage[];
  savedAt: number | null;
  isLoaded: boolean;
}

// Demo store actions
interface DemoStoreActions {
  // Navigation
  advance: () => void;
  goToState: (state: DemoState) => void;
  reset: () => void;

  // Interview
  setUserName: (name: string) => void;
  answerQuestion: (answer: Answer) => void;
  nextQuestion: () => void;
  setTotalQuestions: (count: number) => void;

  // Conversation
  addMessage: (speaker: 'abby' | 'user', text: string) => void;
  clearMessages: () => void;

  // Match
  setMatchData: (match: MatchProfile) => void;

  // Internal
  syncVibeState: (demoState: DemoState) => void;

  // Persistence
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<boolean>; // Returns true if session recovered
  clearStorage: () => Promise<void>;
}

type DemoStore = DemoStoreState & DemoStoreActions;

// Map demo states to app states for vibe controller
const DEMO_TO_APP_STATE: Record<DemoState, AppState> = {
  COACH_INTRO: 'COACH_INTRO',
  INTERVIEW: 'INTERVIEW_LIGHT',
  SEARCHING: 'SEARCHING',
  MATCH: 'MATCH_FOUND',
  PAYMENT: 'MATCH_FOUND',
  REVEAL: 'MATCH_FOUND',
  COACH: 'COACH',
};

// State flow order - SINGLE SOURCE OF TRUTH
// When adding/removing states, update this array AND the DemoState type above
// NOTE: COACH removed from demo flow - demo ends at REVEAL. "Message Alex" should go to MatchesScreen.
const STATE_ORDER: readonly DemoState[] = [
  'COACH_INTRO',
  'INTERVIEW',
  'SEARCHING',
  'MATCH',
  'PAYMENT',
  'REVEAL',
] as const;

// Validate STATE_ORDER matches DemoState type at runtime (dev only)
if (__DEV__) {
  const expectedStates: DemoState[] = ['COACH_INTRO', 'INTERVIEW', 'SEARCHING', 'MATCH', 'PAYMENT', 'REVEAL'];
  const missingStates = expectedStates.filter(s => !STATE_ORDER.includes(s));
  if (missingStates.length > 0) {
    console.error('[DemoStore] STATE_ORDER missing states:', missingStates);
  }
}

/**
 * Get next state safely (returns null if at end or state not found)
 */
const getNextState = (currentState: DemoState): DemoState | null => {
  const currentIndex = STATE_ORDER.indexOf(currentState);
  if (currentIndex === -1) {
    if (__DEV__) console.warn('[DemoStore] Unknown state:', currentState);
    return null;
  }
  if (currentIndex >= STATE_ORDER.length - 1) {
    return null; // Already at end
  }
  return STATE_ORDER[currentIndex + 1];
};

/**
 * Check if state exists in valid state order
 */
const isValidState = (state: DemoState): boolean => {
  return STATE_ORDER.includes(state);
};

export const useDemoStore = create<DemoStore>((set, get) => ({
  // Initial state
  currentState: 'COACH_INTRO',
  currentQuestionIndex: 0,
  totalQuestions: 10,
  answers: [],
  coveragePercent: 0,
  matchData: null,
  userName: '',
  messages: [],
  savedAt: null,
  isLoaded: false,

  // Navigation
  advance: () => {
    const { currentState, syncVibeState } = get();
    const nextState = getNextState(currentState);
    if (nextState) {
      set({ currentState: nextState });
      syncVibeState(nextState);
    } else if (__DEV__) {
      console.log('[DemoStore] Already at final state:', currentState);
    }
  },

  goToState: (state: DemoState) => {
    if (!isValidState(state)) {
      if (__DEV__) console.error('[DemoStore] Invalid state:', state);
      return;
    }
    const { syncVibeState } = get();
    set({ currentState: state });
    syncVibeState(state);
  },

  reset: () => {
    const { syncVibeState, clearStorage } = get();
    set({
      currentState: 'COACH_INTRO',
      currentQuestionIndex: 0,
      answers: [],
      coveragePercent: 0,
      matchData: null,
      userName: '',
      messages: [],
      savedAt: null,
    });
    syncVibeState('COACH_INTRO');
    // Clear storage when explicitly reset (handle async properly)
    clearStorage().catch((err) => {
      if (__DEV__) {
        console.warn('[DemoStore] clearStorage failed:', err);
      }
    });
  },

  // Interview
  setUserName: (name: string) => {
    set({ userName: name });
  },

  answerQuestion: (answer: Answer) => {
    const { answers, totalQuestions } = get();
    const newAnswers = [...answers, answer];
    const newCoverage = totalQuestions > 0 ? (newAnswers.length / totalQuestions) * 100 : 0;

    set({
      answers: newAnswers,
      coveragePercent: newCoverage,
    });

    // Update vibe controller with coverage
    // Use setTimeout(0) to break synchronous execution chain and prevent potential circular updates
    setTimeout(() => {
      const vibeController = useVibeController.getState();
      vibeController.setCoveragePercent(newCoverage);
    }, 0);
  },

  nextQuestion: () => {
    const { currentQuestionIndex, totalQuestions, advance } = get();
    if (currentQuestionIndex < totalQuestions - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      // All questions answered, advance to searching
      advance();
    }
  },

  setTotalQuestions: (count: number) => {
    set({ totalQuestions: count });
  },

  // Conversation
  addMessage: (speaker: 'abby' | 'user', text: string) => {
    const { messages } = get();
    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      speaker,
      text,
      timestamp: Date.now(),
    };
    set({ messages: [...messages, newMessage] });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  // Match
  setMatchData: (match: MatchProfile) => {
    set({ matchData: match });
  },

  // Internal: Sync vibe state with demo state
  // Use setTimeout(0) to break synchronous execution chain and prevent potential circular updates
  syncVibeState: (demoState: DemoState) => {
    setTimeout(() => {
      const vibeController = useVibeController.getState();
      const appState = DEMO_TO_APP_STATE[demoState];
      vibeController.setFromAppState(appState);
    }, 0);
  },

  // Persistence: Save interview state to AsyncStorage
  saveToStorage: async () => {
    try {
      const state = get();
      // Only save if in interview state
      if (state.currentState !== 'INTERVIEW' && state.currentState !== 'COACH_INTRO') {
        return;
      }

      const toSave = {
        version: INTERVIEW_VERSION,
        savedAt: Date.now(),
        currentState: state.currentState,
        currentQuestionIndex: state.currentQuestionIndex,
        totalQuestions: state.totalQuestions,
        answers: state.answers,
        coveragePercent: state.coveragePercent,
        userName: state.userName,
        messages: state.messages,
      };

      await AsyncStorage.setItem(INTERVIEW_KEY, JSON.stringify(toSave));
      set({ savedAt: toSave.savedAt });
      if (__DEV__) {
        if (__DEV__) console.log('[DemoStore] Saved interview, question:', state.currentQuestionIndex);
      }
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) console.error('[DemoStore] Failed to save:', error);
      }
    }
  },

  // Persistence: Load interview state (returns true if session recovered)
  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(INTERVIEW_KEY);
      if (!stored) {
        set({ isLoaded: true });
        return false;
      }

      const data = JSON.parse(stored);

      // Check version
      if (data.version !== INTERVIEW_VERSION) {
        if (__DEV__) {
          if (__DEV__) console.warn('[DemoStore] Version mismatch, clearing');
        }
        await AsyncStorage.removeItem(INTERVIEW_KEY);
        set({ isLoaded: true });
        return false;
      }

      // Check timeout (7 days)
      if (data.savedAt && Date.now() - data.savedAt > INTERVIEW_TIMEOUT_MS) {
        if (__DEV__) {
          if (__DEV__) console.log('[DemoStore] Interview session expired, clearing');
        }
        await AsyncStorage.removeItem(INTERVIEW_KEY);
        set({ isLoaded: true });
        return false;
      }

      // Validate state is recoverable (still in interview)
      if (data.currentState !== 'INTERVIEW' && data.currentState !== 'COACH_INTRO') {
        if (__DEV__) {
          if (__DEV__) console.log('[DemoStore] Session past interview, not recovering');
        }
        await AsyncStorage.removeItem(INTERVIEW_KEY);
        set({ isLoaded: true });
        return false;
      }

      // Restore state
      const { syncVibeState } = get();
      set({
        isLoaded: true,
        savedAt: data.savedAt,
        currentState: data.currentState,
        currentQuestionIndex: data.currentQuestionIndex || 0,
        totalQuestions: data.totalQuestions || 10,
        answers: data.answers || [],
        coveragePercent: data.coveragePercent || 0,
        userName: data.userName || '',
        messages: data.messages || [],
      });
      syncVibeState(data.currentState);

      if (__DEV__) {
        if (__DEV__) console.log('[DemoStore] Recovered interview, question:', data.currentQuestionIndex);
      }
      return true; // Session recovered
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) console.error('[DemoStore] Failed to load:', error);
      }
      set({ isLoaded: true });
      return false;
    }
  },

  // Persistence: Clear storage on completion
  clearStorage: async () => {
    try {
      await AsyncStorage.removeItem(INTERVIEW_KEY);
      if (__DEV__) {
        if (__DEV__) console.log('[DemoStore] Cleared interview storage');
      }
    } catch (error) {
      if (__DEV__) {
        if (__DEV__) console.error('[DemoStore] Failed to clear storage:', error);
      }
    }
  },
}));

// Selectors
export const useDemoState = () => useDemoStore((state) => state.currentState);

export const useInterviewProgress = () =>
  useDemoStore((state) => ({
    currentIndex: state.currentQuestionIndex,
    totalQuestions: state.totalQuestions,
    coveragePercent: state.coveragePercent,
    answersCount: state.answers.length,
  }));

export const useMatchData = () => useDemoStore((state) => state.matchData);

export const useUserName = () => useDemoStore((state) => state.userName);

export const useConversationMessages = () =>
  useDemoStore((state) => state.messages);
