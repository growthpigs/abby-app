/**
 * Safe wrapper for useSafeAreaInsets that provides fallback values
 *
 * This prevents crashes in Expo Go when the native SafeAreaContext
 * hasn't initialized yet (timing issue with New Architecture).
 */

import { useContext } from 'react';
import { SafeAreaInsetsContext, EdgeInsets } from 'react-native-safe-area-context';

// Default insets for iPhone with notch/Dynamic Island
const DEFAULT_INSETS: EdgeInsets = {
  top: 59,     // Status bar + notch
  right: 0,
  bottom: 34,  // Home indicator
  left: 0,
};

/**
 * Like useSafeAreaInsets() but returns default values if context is null.
 * Use this instead of useSafeAreaInsets() to prevent crashes in Expo Go.
 */
export function useSafeInsets(): EdgeInsets {
  const insets = useContext(SafeAreaInsetsContext);

  if (__DEV__ && insets === null) {
    if (__DEV__) console.warn('[useSafeInsets] Context is null, using fallback values');
  }

  return insets ?? DEFAULT_INSETS;
}

export default useSafeInsets;
