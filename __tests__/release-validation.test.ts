/**
 * Release Validation Tests
 *
 * Static validation for release readiness:
 * 1. OpenAI Realtime Service (replaces ElevenLabs)
 * 2. TypeScript structure validation
 * 3. COACH_INTRO feature integration
 * 4. State machine consistency
 *
 * Uses static file analysis to avoid React Native runtime dependencies.
 * Updated for client-api-integration branch (Nathan's API).
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
// TEST 1: OpenAI Realtime Service (Nathan's API)
// ==============================================================================

describe('OpenAI Realtime Service', () => {
  test('AbbyRealtimeService file exists', () => {
    expect(fileExists('src/services/AbbyRealtimeService.ts')).toBe(true);
  });

  test('AbbyRealtimeService exports class', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('export class AbbyRealtimeService');
  });

  test('useAbbyAgent hook is exported (for compatibility)', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('export function useAbbyAgent');
  });

  test('Service has conversation management methods', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('startConversation');
    expect(source).toContain('endConversation');
  });

  test('Service uses client API base URL', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('dev.api.myaimatchmaker.ai');
  });
});

// ==============================================================================
// TEST 2: TypeScript Type Safety
// ==============================================================================

describe('TypeScript Type Resolution', () => {
  test('AppState includes COACH_INTRO', () => {
    const source = readFile('src/types/vibe.ts');
    expect(source).toContain("| 'COACH_INTRO'");
  });

  test('DemoStore has correct state structure', () => {
    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain('currentState');
    expect(source).toContain('messages');
    expect(source).toContain('advance');
    expect(source).toContain('addMessage');
  });

  test('ConversationMessage type is defined and exported', () => {
    const source = readFile('src/components/ui/ConversationOverlay.tsx');
    expect(source).toContain('export interface ConversationMessage');
    expect(source).toContain('speaker:');
    expect(source).toContain('text:');
    expect(source).toContain('timestamp:');
  });
});

// ==============================================================================
// TEST 3: COACH_INTRO Integration
// ==============================================================================

describe('COACH_INTRO Feature Integration', () => {
  test('COACH_INTRO is in useVibeController state mappings', () => {
    const source = readFile('src/store/useVibeController.ts');
    expect(source).toContain('COACH_INTRO: {');
    expect(source).toContain("party: 'ABBY'");
    expect(source).toContain("mode: 'SPEAKING'");
    expect(source).toContain("theme: 'GROWTH'");
  });

  test('COACH_INTRO is in demo state order', () => {
    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain("'COACH_INTRO'");
    expect(source).toContain('const STATE_ORDER');
  });

  test('CoachIntroScreen file exists and is exported', () => {
    expect(fileExists('src/components/screens/CoachIntroScreen.tsx')).toBe(true);

    const indexSource = readFile('src/components/screens/index.ts');
    expect(indexSource).toContain("export { CoachIntroScreen }");
  });

  test('Demo flow starts with COACH_INTRO', () => {
    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain("currentState: 'COACH_INTRO'");
  });

  test('Advancing from COACH_INTRO leads to INTERVIEW', () => {
    const source = readFile('src/store/useDemoStore.ts');

    // STATE_ORDER should have COACH_INTRO followed by INTERVIEW
    const stateOrderMatch = source.match(/const STATE_ORDER[^=]*=\s*\[([\s\S]*?)\]/);
    expect(stateOrderMatch).toBeTruthy();

    const states = stateOrderMatch![1];
    const coachIntroIndex = states.indexOf("'COACH_INTRO'");
    const interviewIndex = states.indexOf("'INTERVIEW'");
    expect(interviewIndex).toBeGreaterThan(coachIntroIndex);
  });
});

// ==============================================================================
// TEST 4: Edge Cases and Error Handling
// ==============================================================================

describe('Edge Cases', () => {
  test('AbbyRealtimeService has cleanup in useAbbyAgent hook', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('return () => {');
  });

  test('CoachIntroScreen has cleanup handlers', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');
    expect(source).toContain('return () => {');
    expect(source).toContain('endConversation');
  });

  test('LogBox warnings are suppressed in index.ts', () => {
    const source = readFile('index.ts');
    expect(source).toContain('LogBox.ignoreLogs');
  });

  test('App.tsx uses client API services', () => {
    const source = readFile('App.tsx');
    expect(source).toContain('AuthService');
  });
});

// ==============================================================================
// TEST 5: Dependencies and Imports
// ==============================================================================

describe('Dependencies', () => {
  test('All required packages are in package.json', () => {
    const pkg = JSON.parse(readFile('package.json'));

    // Auth (Cognito)
    expect(pkg.dependencies['amazon-cognito-identity-js']).toBeDefined();

    // Audio (for TTS)
    expect(pkg.dependencies['expo-av']).toBeDefined();

    // UI
    expect(pkg.dependencies['expo-blur']).toBeDefined();
    expect(pkg.dependencies['expo-haptics']).toBeDefined();
    expect(pkg.dependencies['@expo-google-fonts/merriweather']).toBeDefined();

    // State
    expect(pkg.dependencies['zustand']).toBeDefined();
  });

  test('Merriweather font is loaded in App.tsx', () => {
    const source = readFile('App.tsx');
    expect(source).toContain('@expo-google-fonts/merriweather');
    expect(source).toContain('Merriweather_400Regular');
  });

  test('CoachIntroScreen uses all required imports', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    const requiredImports = [
      'BlurView',
      'Haptics',
      'useDemoStore',
      'PanResponder',
      'Animated',
      'ScrollView',
    ];

    requiredImports.forEach(imp => {
      expect(source).toContain(imp);
    });
  });
});

// ==============================================================================
// TEST 6: State Machine Consistency
// ==============================================================================

describe('State Machine', () => {
  test('All demo states have vibe mappings', () => {
    const vibeSource = readFile('src/store/useVibeController.ts');
    const demoSource = readFile('src/store/useDemoStore.ts');

    // Check that vibeController has APP_STATE_VIBES mapping
    expect(vibeSource).toContain('APP_STATE_VIBES');

    // Check that key states are mapped in demoStore
    expect(demoSource).toContain('DEMO_TO_APP_STATE');
    expect(demoSource).toContain('COACH_INTRO');
    expect(demoSource).toContain('INTERVIEW');
    expect(demoSource).toContain('SEARCHING');
  });

  test('Demo state machine handles COACH_INTRO state', () => {
    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain("'COACH_INTRO'");
  });

  test('Messages state structure is correct', () => {
    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain('messages: ConversationMessage[]');
    expect(source).toContain('messages: []');
  });

  test('addMessage function creates valid message structure', () => {
    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain('addMessage: (speaker:');
    expect(source).toContain("id: `msg-${Date.now()}");
    expect(source).toContain('timestamp:');
  });
});

// ==============================================================================
// TEST 7: Style Properties Validation
// ==============================================================================

describe('Style Properties', () => {
  test('CoachIntroScreen uses StyleSheet.create', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');
    expect(source).toContain('StyleSheet.create');
  });

  test('Transform properties use array syntax', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');
    expect(source).toContain('transform: [');
  });

  test('No invalid style property patterns', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');
    // Make sure we're not using unsupported web-only styles
    expect(source).not.toContain('boxShadow:');
    expect(source).not.toContain('transition:');
  });
});

// ==============================================================================
// TEST 8: TTS Service
// ==============================================================================

describe('TTS Service', () => {
  test('AbbyTTSService file exists', () => {
    expect(fileExists('src/services/AbbyTTSService.ts')).toBe(true);
  });

  test('AbbyTTSService exports speak method', () => {
    const source = readFile('src/services/AbbyTTSService.ts');
    expect(source).toContain('speak');
    expect(source).toContain('stop');
  });

  test('AbbyTTSService uses expo-av for audio', () => {
    const source = readFile('src/services/AbbyTTSService.ts');
    expect(source).toContain('expo-av');
  });
});

// ==============================================================================
// TEST 9: Mute/Unmute Functionality
// ==============================================================================

describe('Mute Functionality', () => {
  test('AbbyRealtimeService has mute functionality', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('toggleMute');
    expect(source).toContain('isMuted');
  });

  test('useAbbyAgent hook exposes mute controls', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('toggleMute,');
    expect(source).toContain('isMuted,');
  });

  test('CoachIntroScreen has mute button', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');
    expect(source).toContain('handleToggleMute');
    expect(source).toContain('toggleMute');
    expect(source).toContain('isMuted');
  });
});
