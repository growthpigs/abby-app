/**
 * Static Validation Tests - No Runtime Dependencies
 *
 * Validates code structure, imports, and integration points
 * without executing React Native code.
 *
 * Updated for client-api-integration branch (Nathan's API / OpenAI Realtime).
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
// TEST 1: OpenAI Realtime Service Structure
// ==============================================================================

describe('OpenAI Realtime Service', () => {
  test('AbbyRealtimeService file exists', () => {
    expect(fileExists('src/services/AbbyRealtimeService.ts')).toBe(true);
  });

  test('AbbyRealtimeService exports class and hook', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');

    expect(source).toContain('export class AbbyRealtimeService');
    expect(source).toContain('export function useAbbyAgent');
  });

  test('Service uses centralized API config', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    // Services should use API_CONFIG, not hardcoded URLs
    expect(source).toContain('API_CONFIG');
    expect(source).toContain('API_CONFIG.API_URL');
  });

  test('Service has demo mode responses', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');
    expect(source).toContain('DEMO_INTRO_MESSAGES');
    expect(source).toContain('DEMO_COACH_MESSAGES');
  });
});

// ==============================================================================
// TEST 2: COACH_INTRO Integration
// ==============================================================================

describe('COACH_INTRO Feature', () => {
  test('CoachIntroScreen file exists', () => {
    expect(fileExists('src/components/screens/CoachIntroScreen.tsx')).toBe(true);
  });

  test('CoachIntroScreen is exported from screens/index.ts', () => {
    const source = readFile('src/components/screens/index.ts');
    expect(source).toContain("export { CoachIntroScreen } from './CoachIntroScreen'");
  });

  test('CoachIntroScreen uses useAbbyAgent hook from AbbyRealtimeService', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain("import { useAbbyAgent } from '../../services/AbbyRealtimeService'");
    expect(source).toContain('startConversation');
    expect(source).toContain('endConversation');
    expect(source).toContain('isConnected');
    expect(source).toContain('useAbbyAgent({');
  });

  test('CoachIntroScreen has cleanup logic', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('return () => {');
    expect(source).toContain('endConversation()');
  });

  test('CoachIntroScreen uses draggable bottom sheet pattern', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('PanResponder');
    expect(source).toContain('SNAP_POINTS');
    expect(source).toContain('Animated.spring');
  });

  test('CoachIntroScreen handles messages from agent', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('onAbbyResponse');
    expect(source).toContain('addMessage');
  });

  test('CoachIntroScreen sets background shader', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('onBackgroundChange');
  });
});

// ==============================================================================
// TEST 3: Type System Integration
// ==============================================================================

describe('TypeScript Integration', () => {
  test('COACH_INTRO is in AppState type', () => {
    const source = readFile('src/types/vibe.ts');
    expect(source).toContain("| 'COACH_INTRO'");
  });

  test('COACH_INTRO is in DemoState type', () => {
    const source = readFile('src/store/useDemoStore.ts');
    expect(source).toContain("| 'COACH_INTRO'");
  });

  test('COACH_INTRO has vibe mapping in useVibeController', () => {
    const source = readFile('src/store/useVibeController.ts');

    expect(source).toContain('COACH_INTRO: {');
    expect(source).toContain("party: 'ABBY'");
    expect(source).toContain("mode: 'SPEAKING'");
  });

  test('COACH_INTRO is in STATE_ORDER', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('const STATE_ORDER');
    expect(source).toContain("'COACH_INTRO'");
  });

  test('COACH_INTRO is initial state', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain("currentState: 'COACH_INTRO'");
  });

  test('ConversationMessage type is exported and used', () => {
    const overlaySource = readFile('src/components/ui/ConversationOverlay.tsx');
    const storeSource = readFile('src/store/useDemoStore.ts');

    expect(overlaySource).toContain('export interface ConversationMessage');
    expect(storeSource).toContain("import { ConversationMessage } from '../components/ui/ConversationOverlay'");
  });
});

// ==============================================================================
// TEST 4: Auth Service Integration (Nathan's API)
// ==============================================================================

describe('Auth Service', () => {
  test('AuthService file exists', () => {
    expect(fileExists('src/services/AuthService.ts')).toBe(true);
  });

  test('AuthService uses Cognito', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('amazon-cognito-identity-js');
    expect(source).toContain('CognitoConfig'); // Uses helper from CognitoConfig
    expect(source).toContain('getAuthDetails'); // Authentication helper
  });

  test('AuthService has login and signup methods', () => {
    const source = readFile('src/services/AuthService.ts');
    expect(source).toContain('login');
    expect(source).toContain('signup');
    expect(source).toContain('verify'); // verify email with code
  });
});

// ==============================================================================
// TEST 5: LogBox Warning Suppression
// ==============================================================================

describe('LogBox Configuration', () => {
  test('index.ts suppresses warnings', () => {
    const source = readFile('index.ts');

    expect(source).toContain("import { LogBox } from 'react-native'");
    expect(source).toContain('LogBox.ignoreLogs([');
  });
});

// ==============================================================================
// TEST 6: Demo Store Integration
// ==============================================================================

describe('Demo Store', () => {
  test('Has messages array in state', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('messages: ConversationMessage[]');
    expect(source).toContain('messages: []');
  });

  test('Has addMessage action', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('addMessage: (speaker:');
    expect(source).toContain("id: `msg-${Date.now()}");
  });

  test('Has clearMessages action', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('clearMessages: () =>');
    expect(source).toContain('messages: []');
  });

  test('STATE_ORDER defines COACH_INTRO as starting state', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('STATE_ORDER');
    expect(source).toContain("'COACH_INTRO'");
    expect(source).toContain("currentState: 'COACH_INTRO'");
  });
});

// ==============================================================================
// TEST 7: UI Dependencies
// ==============================================================================

describe('UI Dependencies', () => {
  test('Package.json has all required packages', () => {
    const pkg = JSON.parse(readFile('package.json'));

    // Auth
    expect(pkg.dependencies['amazon-cognito-identity-js']).toBeDefined();

    // Audio
    expect(pkg.dependencies['expo-av']).toBeDefined();

    // UI
    expect(pkg.dependencies['expo-blur']).toBeDefined();
    expect(pkg.dependencies['expo-haptics']).toBeDefined();
    expect(pkg.dependencies['@expo-google-fonts/merriweather']).toBeDefined();
    expect(pkg.dependencies['zustand']).toBeDefined();
  });

  test('CoachIntroScreen imports required components', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    const requiredImports = [
      'BlurView',
      'Haptics',
      'useDemoStore',
      'useAbbyAgent',
      'ScrollView',
      'Animated',
      'PanResponder',
    ];

    requiredImports.forEach(imp => {
      expect(source).toContain(imp);
    });
  });

  test('CoachIntroScreen uses Merriweather font', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain("fontFamily: 'Merriweather_400Regular'");
  });
});

// ==============================================================================
// TEST 8: Style Properties
// ==============================================================================

describe('Style Validation', () => {
  test('CoachIntroScreen uses StyleSheet.create', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('StyleSheet.create({');
  });

  test('CoachIntroScreen has valid style structure', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('const styles = StyleSheet.create({');
    expect(source).toContain('container:');
    expect(source).toContain('bottomSheet:');
    expect(source).toContain('blurContainer:');
  });

  test('Transform property uses array syntax', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('transform: [{ translateY }]');
  });
});

// ==============================================================================
// TEST 9: Edge Case Handling
// ==============================================================================

describe('Edge Case Handling', () => {
  test('AbbyRealtimeService has cleanup in useAbbyAgent hook', () => {
    const source = readFile('src/services/AbbyRealtimeService.ts');

    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('return () => {');
  });

  test('CoachIntroScreen handles connection errors', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('onError');
    expect(source).toContain('setAgentStatus');
  });

  test('CoachIntroScreen auto-starts conversation on mount', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('startConversation()');
  });
});

// ==============================================================================
// TEST 10: Demo Flow Integrity
// ==============================================================================

describe('Demo Flow', () => {
  test('CoachIntroScreen advances to INTERVIEW on button press', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('handleStartInterview');
    expect(source).toContain('advance()');
    expect(source).toContain('endConversation');
  });

  test('STATE_ORDER starts with COACH_INTRO', () => {
    const source = readFile('src/store/useDemoStore.ts');

    const stateOrderMatch = source.match(/const STATE_ORDER[^=]*=\s*\[([\s\S]*?)\]/);
    expect(stateOrderMatch).toBeTruthy();

    const firstState = stateOrderMatch![1].trim().split(',')[0].trim();
    expect(firstState).toBe("'COACH_INTRO'");
  });

  test('Vibe controller has COACH_INTRO configuration', () => {
    const source = readFile('src/store/useVibeController.ts');

    const coachIntroMatch = source.match(/COACH_INTRO:\s*{[\s\S]*?}/);
    expect(coachIntroMatch).toBeTruthy();

    const config = coachIntroMatch![0];
    expect(config).toContain("party: 'ABBY'");
    expect(config).toContain("mode: 'SPEAKING'");
    expect(config).toContain("theme: 'GROWTH'");
  });
});

// ==============================================================================
// TEST 11: TTS Service
// ==============================================================================

describe('TTS Service', () => {
  test('AbbyTTSService file exists', () => {
    expect(fileExists('src/services/AbbyTTSService.ts')).toBe(true);
  });

  test('AbbyTTSService has speak and stop methods', () => {
    const source = readFile('src/services/AbbyTTSService.ts');
    expect(source).toContain('speak');
    expect(source).toContain('stop');
  });

  test('AbbyTTSService uses expo-av', () => {
    const source = readFile('src/services/AbbyTTSService.ts');
    expect(source).toContain('expo-av');
  });
});
