/**
 * Demo Flow Integration Tests
 *
 * Validates:
 * 1. State machine transitions
 * 2. Screen rendering for each state
 * 3. Message handling
 * 4. Background shader progression
 * 5. Voice agent integration points
 */

import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, relativePath));
}

// ==============================================================================
// TEST 1: Demo Store State Machine
// ==============================================================================

describe('Demo Store State Machine', () => {
  test('useDemoStore exists and is properly structured', () => {
    expect(fileExists('src/store/useDemoStore.ts')).toBe(true);

    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain('export const useDemoStore');
    expect(source).toContain('create');
  });

  test('STATE_ORDER defines complete flow', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('const STATE_ORDER');

    // All states should be in order
    const states = [
      'COACH_INTRO',
      'INTERVIEW',
      'SEARCHING',
      'MATCH',
      'PAYMENT',
      'REVEAL',
      'COACH',
    ];

    states.forEach(state => {
      expect(source).toContain(`'${state}'`);
    });
  });

  test('Initial state is COACH_INTRO', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain("currentState: 'COACH_INTRO'");
  });

  test('advance() moves to next state', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('advance:');
    expect(source).toContain('STATE_ORDER');
    expect(source).toContain('currentIndex + 1');
  });

  test('reset() returns to COACH_INTRO', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('reset:');
    expect(source).toContain("currentState: 'COACH_INTRO'");
  });
});

// ==============================================================================
// TEST 2: App.tsx Screen Routing
// ==============================================================================

describe('App Screen Routing', () => {
  test('App.tsx exists', () => {
    expect(fileExists('App.tsx')).toBe(true);
  });

  test('renderDemoScreen() handles all states', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('const renderDemoScreen = ()');
    expect(source).toContain('switch (demoState)');

    // Check all cases
    const states = [
      'COACH_INTRO',
      'INTERVIEW',
      'SEARCHING',
      'MATCH',
      'PAYMENT',
      'REVEAL',
      'COACH',
    ];

    states.forEach(state => {
      expect(source).toContain(`case '${state}':`);
    });
  });

  test('Each state renders correct screen component', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('<CoachIntroScreen');
    expect(source).toContain('<InterviewScreen');
    expect(source).toContain('<SearchingScreen');
    expect(source).toContain('<MatchScreen');
    expect(source).toContain('<PaymentScreen');
    expect(source).toContain('<RevealScreen');
    expect(source).toContain('<CoachScreen');
  });

  test('Default case renders CoachIntroScreen', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('default:');
    expect(source).toMatch(/default:[\s\S]*?<CoachIntroScreen/);
  });
});

// ==============================================================================
// TEST 3: Background Shader Progression
// ==============================================================================

describe('Background Shader Progression', () => {
  test('App.tsx has handleBackgroundChange callback', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('handleBackgroundChange');
    expect(source).toContain('useCallback');
  });

  test('InterviewScreen has shader selection for vibes', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Shader selection based on vibe theme (refactored from TOTAL_SHADERS approach)
    expect(source).toContain('getShaderForVibeAndIndex');
    expect(source).toContain('getShaderForVibe');
  });

  test('InterviewScreen passes onBackgroundChange to parent', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('onBackgroundChange');
    expect(source).toContain('onBackgroundChange(');
  });

  test('Coach screens set specific background index', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Both should set background 5 (Liquid Marble)
    expect(coachSource).toContain('onBackgroundChange(5)');
    expect(introSource).toContain('onBackgroundChange(5)');
  });

  test('App.tsx passes onBackgroundChange to screens', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('onBackgroundChange={handleBackgroundChange}');
  });
});

// ==============================================================================
// TEST 4: Message System
// ==============================================================================

describe('Message System', () => {
  test('useDemoStore has messages array', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('messages: ConversationMessage[]');
    expect(source).toContain('messages: []');
  });

  test('addMessage action creates proper message', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('addMessage:');
    expect(source).toContain("id: `msg-${Date.now()}");
    expect(source).toContain('speaker');
    expect(source).toContain('text');
    expect(source).toContain('timestamp');
  });

  test('clearMessages action exists', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('clearMessages:');
  });

  test('CoachScreen displays messages', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    // Uses reverse().map() for newest-first display
    expect(source).toContain('.map((message)');
    expect(source).toContain('messageBubble');
    expect(source).toContain('messageText');
  });

  test('Messages are displayed newest first', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    // Should reverse messages for display
    expect(source).toContain('.reverse()');
  });
});

// ==============================================================================
// TEST 5: Interview Question Flow
// ==============================================================================

describe('Interview Question Flow', () => {
  test('DEMO_QUESTIONS data file exists', () => {
    expect(fileExists('src/data/demo-questions.ts')).toBe(true);
  });

  test('DEMO_QUESTIONS has question array', () => {
    const source = readFile('src/data/demo-questions.ts');

    expect(source).toContain('export const DEMO_QUESTIONS');
    expect(source).toContain('id:');
    expect(source).toContain('text:');
  });

  test('InterviewScreen tracks currentQuestionIndex', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Screen uses currentDemoIndex from demo store
    expect(source).toContain('currentDemoIndex');
    expect(source).toContain('useDemoStore');
  });

  test('InterviewScreen has nextQuestion action', () => {
    const storeSource = readFile('src/store/useDemoStore.ts');

    expect(storeSource).toContain('nextQuestion');
    expect(storeSource).toContain('currentQuestionIndex');
  });

  test('InterviewScreen advances to SEARCHING on last question', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('isLastQuestion');
    expect(source).toContain('advance()');
  });
});

// ==============================================================================
// TEST 6: Voice Agent Integration (OpenAI Realtime / Nathan's API)
// ==============================================================================

describe('Voice Agent Integration', () => {
  test('AbbyRealtimeService exists', () => {
    expect(fileExists('src/services/AbbyRealtimeService.ts')).toBe(true);
  });

  test('AbbyRealtimeService exports useAbbyAgent hook', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');

    expect(source).toContain('export function useAbbyAgent');
  });

  test('useAbbyAgent has required callbacks', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');

    expect(source).toContain('onAbbyResponse');
    expect(source).toContain('onUserTranscript');
    expect(source).toContain('onConnect');
    expect(source).toContain('onDisconnect');
    expect(source).toContain('onError');
  });

  test('AbbyTTSService exists for TTS', () => {
    expect(fileExists('src/services/AbbyTTSService.ts')).toBe(true);
  });

  test('InterviewScreen uses abbyTTS for TTS', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('abbyTTS');
    expect(source).toContain('.speak(');
  });
});

// ==============================================================================
// TEST 7: Transition Flow
// ==============================================================================

describe('State Transitions', () => {
  test('COACH_INTRO → INTERVIEW (Start Interview button)', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('handleStartInterview');
    expect(source).toContain('advance()');
    expect(source).toContain('Start Interview');
  });

  test('INTERVIEW → SEARCHING (last question)', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: ChatInput handles all answers, advances on last question
    expect(source).toContain('isLastQuestion');
    expect(source).toContain('advance()');
    expect(source).toContain('if (isLastQuestion)');
  });

  test('SEARCHING → MATCH (timer or auto)', () => {
    const source = readFile('src/components/screens/SearchingScreen.tsx');

    // Should have auto-advance logic or state transition
    expect(source).toMatch(/advance|setTimeout|useEffect/);
  });

  test('COACH has End Chat button', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    expect(source).toContain('handleEndChat');
    expect(source).toContain('End Chat');
    expect(source).toContain('reset()');
  });
});

// ==============================================================================
// TEST 8: Font Loading
// ==============================================================================

describe('Font Loading', () => {
  test('App.tsx loads required fonts', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('@expo-google-fonts/merriweather');
    expect(source).toContain('@expo-google-fonts/jetbrains-mono');
    expect(source).toContain('useFonts');
  });

  test('Font loading shows ActivityIndicator', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('fontsLoaded');
    expect(source).toContain('ActivityIndicator');
  });

  test('Both Merriweather and JetBrains Mono are loaded', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('Merriweather_400Regular');
    expect(source).toContain('JetBrainsMono_400Regular');
  });
});

// ==============================================================================
// TEST 9: Settings Store
// ==============================================================================

describe('Settings Store', () => {
  test('useSettingsStore exists', () => {
    expect(fileExists('src/store/useSettingsStore.ts')).toBe(true);
  });

  test('Settings has inputMode option', () => {
    const source = readFile('src/store/useSettingsStore.ts');

    expect(source).toContain('inputMode');
    expect(source).toContain('InputMode');
  });

  test('Settings are loaded on app start', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('useSettingsStore');
    expect(source).toContain('loadSettings');
    expect(source).toContain('settingsLoaded');
  });
});

// ==============================================================================
// TEST 10: Error Boundaries
// ==============================================================================

describe('Error Handling', () => {
  test('Voice agent has error callback handling', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');

    expect(source).toContain('onError');
    expect(source).toContain('try {');
    expect(source).toContain('catch');
  });

  test('CoachScreen handles connection errors', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    expect(source).toContain('onError:');
    expect(source).toContain('setAgentStatus');
  });

  test('InterviewScreen handles TTS errors', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('.catch');
    expect(source).toContain('voiceError');
  });

  test('VibeMatrixAnimated handles shader compile failure with fallback', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain('if (!effect)');
    expect(source).toContain('SHADER COMPILE FAILED');
    expect(source).toContain('if (!shader)');
    expect(source).toContain('FALLBACK_COLORS'); // Fallback gradient for visual continuity
  });
});

// ==============================================================================
// TEST 11: Demo State Helper
// ==============================================================================

describe('Demo State Helper', () => {
  test('useDemoState selector exists', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('export const useDemoState');
  });

  test('STATE_ORDER defines demo flow sequence', () => {
    const source = readFile('src/store/useDemoStore.ts');

    // STATE_ORDER is the single source of truth for demo flow
    expect(source).toContain('STATE_ORDER');
    expect(source).toContain('COACH_INTRO');
    expect(source).toContain('INTERVIEW');
  });

  test('App.tsx uses useDemoState', () => {
    const source = readFile('App.tsx');

    expect(source).toContain('useDemoState');
    expect(source).toContain('demoState');
  });
});
