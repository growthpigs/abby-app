import { registerRootComponent } from 'expo';

/**
 * TEST MODE SELECTOR
 *
 * Switch between different test configurations:
 * - 'liquid'  : William Candillon style liquid glass blobs
 * - 'simple'  : Minimal shader animation test
 * - 'shader'  : CC1's VibeMatrix shader test
 * - 'orb'     : CC2's AbbyOrb + VibeMatrix test
 * - 'full'    : Full Glass Sandwich (when ready)
 */
const TEST_MODE: 'liquid' | 'simple' | 'shader' | 'orb' | 'full' = 'liquid';

// Import based on test mode
const getApp = () => {
  switch (TEST_MODE) {
    case 'liquid':
      return require('./App.liquid').default;
    case 'simple':
      return require('./App.simple').default;
    case 'orb':
      return require('./App.orb').default;
    default:
      return require('./App').default;
  }
};
const App = getApp();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
