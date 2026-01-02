/**
 * Animated Value Helpers
 *
 * Type-safe utilities for accessing React Native Animated internals.
 * These are necessary for advanced pan responder patterns where we need
 * to read the current animated value synchronously.
 *
 * Note: These access private RN internals (_value, _offset) which may
 * change in future React Native versions. Encapsulating them here makes
 * updates easier if the API changes.
 */

import { Animated } from 'react-native';

/** Internal structure of Animated.Value (private RN API) */
interface AnimatedValueInternal {
  _value: number;
  _offset: number;
}

/**
 * Get the current value of an Animated.Value synchronously.
 * Use this when you need the value in a pan responder callback.
 */
export function getAnimatedValue(animated: Animated.Value): number {
  return (animated as unknown as AnimatedValueInternal)._value;
}

/**
 * Get the current offset of an Animated.Value synchronously.
 * Use this when calculating constraints during pan gestures.
 */
export function getAnimatedOffset(animated: Animated.Value): number {
  return (animated as unknown as AnimatedValueInternal)._offset;
}
