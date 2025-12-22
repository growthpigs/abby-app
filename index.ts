import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress warnings that don't affect functionality
// - LiveKit WebSocket warnings during reconnection
// - expo-av deprecation (AbbyVoice still uses it, migration deferred)
// - SafeAreaView deprecation (internal to expo-blur, not our code)
LogBox.ignoreLogs([
  'Websocket got closed during',
  'websocket closed',
  'could not createOffer with closed peer connection',
  'rn-webrtc',
  '[expo-av]',
  'SafeAreaView has been deprecated',
  'Cannot send message: room not connected',
]);

/**
 * DEMO MODE
 *
 * Full demo flow: Onboarding → Interview → Searching → Match → Payment → Reveal
 * Includes:
 * - Settings (input mode selection)
 * - ConversationOverlay (transcript display)
 * - Voice input (hold mic to speak)
 */
import App from './App.demo';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
