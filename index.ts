import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress LiveKit WebSocket warnings from appearing as toasts
// These are expected during reconnection and don't affect functionality
LogBox.ignoreLogs([
  'Websocket got closed during',
  'websocket closed',
  'could not createOffer with closed peer connection',
  'rn-webrtc',
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
