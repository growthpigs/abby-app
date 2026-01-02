/**
 * Safe Haptics Wrapper
 *
 * Provides error-safe haptic feedback functions.
 * Fails gracefully on devices/simulators that don't support haptics.
 */

import * as Haptics from 'expo-haptics';

/**
 * Trigger impact haptic feedback safely
 * @param style The impact style (Light, Medium, Heavy)
 * @returns Promise that resolves even if haptics fail
 */
export async function safeImpact(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium
): Promise<void> {
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    // Haptics not supported or failed
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      if (__DEV__) console.warn('[Haptics] Impact feedback failed:', error);
    }
    // Silently fail in production
  }
}

/**
 * Trigger selection haptic feedback safely
 * @returns Promise that resolves even if haptics fail
 */
export async function safeSelection(): Promise<void> {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Haptics not supported or failed
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      if (__DEV__) console.warn('[Haptics] Selection feedback failed:', error);
    }
    // Silently fail in production
  }
}

/**
 * Trigger notification haptic feedback safely
 * @param type The notification type (Success, Warning, Error)
 * @returns Promise that resolves even if haptics fail
 */
export async function safeNotification(
  type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success
): Promise<void> {
  try {
    await Haptics.notificationAsync(type);
  } catch (error) {
    // Haptics not supported or failed
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      if (__DEV__) console.warn('[Haptics] Notification feedback failed:', error);
    }
    // Silently fail in production
  }
}

export default {
  safeImpact,
  safeSelection,
  safeNotification,
};
