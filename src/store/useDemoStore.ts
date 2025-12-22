/**
 * Demo State Machine
 *
 * Controls the demo flow through 6 states:
 * ONBOARDING → INTERVIEW → SEARCHING → MATCH → PAYMENT → REVEAL
 *
 * Integrates with VibeController to trigger visual state changes.
 */

import { create } from 'zustand';
import { VibeColorTheme, AppState } from '../types/vibe';
import { useVibeController } from './useVibeController';
import { ConversationMessage } from '../components/ui/ConversationOverlay';

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

// State flow order
const STATE_ORDER: DemoState[] = [
  'COACH_INTRO',
  'INTERVIEW',
  'SEARCHING',
  'MATCH',
  'PAYMENT',
  'REVEAL',
  'COACH',
];

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

  // Navigation
  advance: () => {
    const { currentState, syncVibeState } = get();
    const currentIndex = STATE_ORDER.indexOf(currentState);
    if (currentIndex < STATE_ORDER.length - 1) {
      const nextState = STATE_ORDER[currentIndex + 1];
      set({ currentState: nextState });
      syncVibeState(nextState);
    }
  },

  goToState: (state: DemoState) => {
    const { syncVibeState } = get();
    set({ currentState: state });
    syncVibeState(state);
  },

  reset: () => {
    const { syncVibeState } = get();
    set({
      currentState: 'COACH_INTRO',
      currentQuestionIndex: 0,
      answers: [],
      coveragePercent: 0,
      matchData: null,
      userName: '',
      messages: [],
    });
    syncVibeState('COACH_INTRO');
  },

  // Interview
  setUserName: (name: string) => {
    set({ userName: name });
  },

  answerQuestion: (answer: Answer) => {
    const { answers, totalQuestions } = get();
    const newAnswers = [...answers, answer];
    const newCoverage = (newAnswers.length / totalQuestions) * 100;

    set({
      answers: newAnswers,
      coveragePercent: newCoverage,
    });

    // Update vibe controller with coverage
    const vibeController = useVibeController.getState();
    vibeController.setCoveragePercent(newCoverage);
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
  syncVibeState: (demoState: DemoState) => {
    const vibeController = useVibeController.getState();
    const appState = DEMO_TO_APP_STATE[demoState];
    vibeController.setFromAppState(appState);
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
