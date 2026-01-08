import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';

// Suppress warnings that don't affect functionality
// - expo-av deprecation (AbbyTTSService uses it for audio playback)
// - SafeAreaView deprecation (internal to expo-blur, not our code)
LogBox.ignoreLogs([
  '[expo-av]',
  'SafeAreaView has been deprecated',
]);

/**
 * FULL AUTH FLOW
 *
 * Complete flow: Login → Phone → Email → CoachIntro → Interview → Match → etc.
 * Uses VibeMatrix animated shader backgrounds.
 */
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
