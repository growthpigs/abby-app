import { registerRootComponent } from 'expo';

/**
 * DEV MODE
 *
 * Uses App.dev.tsx which has a runtime toggle between:
 * - SHADERS: Background + Orb testing (App.liquid)
 * - ABBY: Voice/TTS testing (App.abby)
 *
 * Toggle button in top-right corner of screen.
 */
import App from './App.dev';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
