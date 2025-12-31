/**
 * Static Validation Tests - No Runtime Dependencies
 *
 * Validates code structure, imports, and integration points
 * without executing React Native code.
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
// TEST 1: Conditional Import Structure
// ==============================================================================

describe('Conditional Import Logic', () => {
  test('AbbyAgent has try-catch for ElevenLabs import', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    expect(source).toContain('try {');
    expect(source).toContain("require('@elevenlabs/react-native')");
    expect(source).toContain("require('@livekit/react-native')");
    expect(source).toContain('} catch (e) {');
    expect(source).toContain('VOICE_AVAILABLE = true');
  });

  test('AbbyAgent exports VOICE_AVAILABLE flag', () => {
    const source = readFile('src/services/AbbyAgent.ts');
    expect(source).toContain('export let VOICE_AVAILABLE');
  });

  test('Mock conversation provides error feedback via callbacks', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    // Mock should call onError callback
    expect(source).toContain('options?.onError?.(');
    expect(source).toContain('Voice features require a development build');
  });

  test('AGENT_ID validation checks for empty string', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    expect(source).toContain('!AGENT_ID || AGENT_ID.trim().length === 0');
    expect(source).toContain('ELEVENLABS_AGENT_ID not configured');
  });

  test('AGENT_ID format validation checks agent_ prefix', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    expect(source).toContain("!AGENT_ID.startsWith('agent_')");
    expect(source).toContain('must start with "agent_"');
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

  test('CoachIntroScreen uses useAbbyAgent hook', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain("import { useAbbyAgent } from '../../services/AbbyAgent'");
    // Check for key destructured properties (mute features added later)
    expect(source).toContain('startConversation');
    expect(source).toContain('endConversation');
    expect(source).toContain('isConnected');
    expect(source).toContain('useAbbyAgent({');
  });

  test('CoachIntroScreen has cleanup logic', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Should have useEffect with cleanup
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

  test('CoachIntroScreen handles messages from AbbyAgent', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('onAbbyResponse: (text) =>');
    expect(source).toContain('onUserTranscript: (text) =>');
    expect(source).toContain('addMessage');
  });

  test('CoachIntroScreen sets background shader', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('onBackgroundChange');
    expect(source).toContain('useEffect(() => {');
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
// TEST 4: App.demo.tsx Integration
// ==============================================================================

describe('App.demo.tsx', () => {
  test('Conditionally imports ElevenLabsProvider', () => {
    const source = readFile('App.demo.tsx');

    expect(source).toContain('let ElevenLabsProvider');
    expect(source).toContain('try {');
    expect(source).toContain("require('@elevenlabs/react-native')");
    expect(source).toContain('} catch (e) {');
  });

  test('Conditionally wraps with ElevenLabsProvider', () => {
    const source = readFile('App.demo.tsx');

    expect(source).toContain('if (ElevenLabsProvider) {');
    expect(source).toContain('<ElevenLabsProvider>');
    expect(source).toContain('<DemoScreen />'); // Now wrapped in ErrorBoundary
    expect(source).toContain('<ErrorBoundary>'); // Error boundary added
  });

  test('useAbbyAgent enabled for COACH_INTRO', () => {
    const source = readFile('App.demo.tsx');

    expect(source).toContain("enabled: currentState === 'COACH_INTRO' || currentState === 'COACH'");
  });

  test('Renders CoachIntroScreen for COACH_INTRO state', () => {
    const source = readFile('App.demo.tsx');

    expect(source).toContain("case 'COACH_INTRO':");
    expect(source).toContain('<CoachIntroScreen');
  });

  test('Sets initial state to COACH_INTRO', () => {
    const source = readFile('App.demo.tsx');

    expect(source).toContain("setFromAppState('COACH_INTRO')");
  });

  test('Imports VOICE_AVAILABLE flag', () => {
    const source = readFile('App.demo.tsx');

    expect(source).toContain('VOICE_AVAILABLE');
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
    expect(source).toContain('expo-av'); // Client API uses expo-av for TTS
    expect(source).toContain('SafeAreaView has been deprecated'); // Internal to expo-blur
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

  test('Maps COACH_INTRO to COACH_INTRO app state', () => {
    const source = readFile('src/store/useDemoStore.ts');

    expect(source).toContain('const DEMO_TO_APP_STATE');
    expect(source).toContain("COACH_INTRO: 'COACH_INTRO'");
  });
});

// ==============================================================================
// TEST 7: UI Dependencies
// ==============================================================================

describe('UI Dependencies', () => {
  test('Package.json has all required packages', () => {
    const pkg = JSON.parse(readFile('package.json'));

    expect(pkg.dependencies['@elevenlabs/react-native']).toBeDefined();
    expect(pkg.dependencies['@livekit/react-native']).toBeDefined();
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

    // Check for key styles
    expect(source).toContain('const styles = StyleSheet.create({');
    expect(source).toContain('container:');
    expect(source).toContain('bottomSheet:');
    expect(source).toContain('blurContainer:');
  });

  test('Transform property uses array syntax', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Check for transform with array
    expect(source).toContain('transform: [{ translateY }]');
  });
});

// ==============================================================================
// TEST 9: Edge Case Handling
// ==============================================================================

describe('Edge Case Handling', () => {
  test('AbbyAgent handles navigation away during session', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    // Cleanup on unmount
    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('return () => {');
    expect(source).toContain('clearInterval');
  });

  test('AbbyAgent has multiple start guards', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    // Should have multiple guards
    expect(source).toContain('// Guard 1:');
    expect(source).toContain('// Guard 2:');
    expect(source).toContain('// Guard 3:');
    expect(source).toContain('// Guard 4:');
    expect(source).toContain('// Guard 5:');
  });

  test('CoachIntroScreen handles connection errors', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('onError: (error) =>');
    expect(source).toContain('setAgentStatus');
  });

  test('CoachIntroScreen auto-starts conversation on mount', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('initConversation');
    expect(source).toContain('startConversation()');
  });
});

// ==============================================================================
// TEST 10: Flow Integrity
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
    expect(config).toContain("complexity: 'SMOOTHIE'");
    expect(config).toContain("orbEnergy: 'CALM'");
  });
});

// ==============================================================================
// TEST 11: Audio Session Configuration
// ==============================================================================

describe('Audio Configuration', () => {
  test('AbbyAgent configures iOS audio for speaker output', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    expect(source).toContain('setAppleAudioConfiguration');
    expect(source).toContain("audioCategory: 'playAndRecord'");
    expect(source).toContain("audioMode: 'spokenAudio'");  // Optimized for voice apps
    expect(source).toContain('defaultToSpeaker');
  });

  test('AbbyAgent starts audio session before connection', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    // Audio session calls are wrapped in withTimeout for safety
    expect(source).toContain('AudioSession.startAudioSession()');
    expect(source).toContain("AudioSession.selectAudioOutput('force_speaker')");
  });

  test('AbbyAgent stops audio session on disconnect', () => {
    const source = readFile('src/services/AbbyAgent.ts');

    expect(source).toContain('AudioSession.stopAudioSession()');
    expect(source).toContain('onDisconnect:');
  });
});
