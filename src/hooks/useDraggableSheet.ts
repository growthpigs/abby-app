/**
 * useDraggableSheet - Reusable draggable bottom sheet logic
 *
 * Extracts the common pan responder and snap point logic used by
 * CoachIntroScreen and CoachScreen. Uses standard Animated API.
 *
 * ⚠️ INTERNAL API ACCESS: React Native Animated.Value
 * This hook accesses Animated.Value internals (_value, _offset) via type
 * assertions. These are undocumented APIs used for gesture state tracking.
 * While stable across RN versions, test pan gestures after major RN upgrades.
 * See lines 131, 137, 147 for the internal access points.
 *
 * Usage:
 *   const { translateY, panHandlers, animateIn } = useDraggableSheet({
 *     snapPoints: [0.35, 0.55, 0.75, 0.9],
 *     defaultSnap: 0.55,
 *   });
 *
 *   useEffect(() => { animateIn(); }, []);
 *
 *   <Animated.View style={{ transform: [{ translateY }] }}>
 *     <View {...panHandlers}>
 *       {// Handle area //}
 *     </View>
 *   </Animated.View>
 */

import { useRef, useCallback } from 'react';
import { Animated, PanResponder, Dimensions, GestureResponderHandlers } from 'react-native';
import { SHEET_SNAP_POINTS, SHEET_DEFAULT_SNAP } from '../constants/layout';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DraggableSheetConfig {
  /**
   * Snap points as percentages of screen height (from bottom)
   * e.g., [0.35, 0.55, 0.75, 0.9] means 35%, 55%, 75%, 90%
   */
  snapPoints?: number[];
  /**
   * Initial snap point percentage
   * @default 0.55 (55% of screen height)
   */
  defaultSnap?: number;
  /**
   * Spring animation config
   */
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
  /**
   * Callback when sheet position changes
   */
  onSnapChange?: (snapIndex: number) => void;
}

interface DraggableSheetReturn {
  /**
   * Animated value for translateY transform
   */
  translateY: Animated.Value;
  /**
   * Pan responder handlers to spread on draggable area
   */
  panHandlers: GestureResponderHandlers;
  /**
   * Animate sheet to default snap point (call on mount)
   */
  animateIn: () => void;
  /**
   * Animate sheet to a specific snap point by index
   */
  snapTo: (snapIndex: number) => void;
  /**
   * Animate sheet out (fully off screen)
   */
  animateOut: () => void;
}

// Use centralized constants - SINGLE SOURCE OF TRUTH
const DEFAULT_SNAP_POINTS = [...SHEET_SNAP_POINTS];
const DEFAULT_SNAP = SHEET_DEFAULT_SNAP;
const DEFAULT_SPRING_CONFIG = { damping: 50, stiffness: 400 };

export function useDraggableSheet(config?: DraggableSheetConfig): DraggableSheetReturn {
  const {
    snapPoints = DEFAULT_SNAP_POINTS,
    defaultSnap = DEFAULT_SNAP,
    springConfig = DEFAULT_SPRING_CONFIG,
    onSnapChange,
  } = config ?? {};

  // Animated value starts off-screen (at bottom)
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Find closest snap point from a given position
  const findClosestSnapPoint = useCallback(
    (position: number): { snapY: number; snapIndex: number } => {
      const currentPercentage = 1 - position / SCREEN_HEIGHT;
      let closestIndex = 0;
      let minDistance = Math.abs(currentPercentage - snapPoints[0]);

      for (let i = 0; i < snapPoints.length; i++) {
        const distance = Math.abs(currentPercentage - snapPoints[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      return {
        snapY: SCREEN_HEIGHT * (1 - snapPoints[closestIndex]),
        snapIndex: closestIndex,
      };
    },
    [snapPoints]
  );

  // Pan responder for draggable area
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        // Store current position as offset
        // ⚠️ INTERNAL API: Accessing _value (see VERSION LOCK in header)
        translateY.setOffset((translateY as unknown as { _value: number })._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy;
        // ⚠️ INTERNAL API: Accessing _offset (see VERSION LOCK in header)
        const offset = (translateY as unknown as { _offset: number })._offset;
        const minY = SCREEN_HEIGHT * 0.1 - offset; // Don't go above 10% from top
        const maxY = SCREEN_HEIGHT - offset; // Don't go below screen

        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        translateY.setValue(constrainedY);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        // ⚠️ INTERNAL API: Accessing _value (see VERSION LOCK in header)
        const currentY = (translateY as unknown as { _value: number })._value;
        const velocity = gestureState.vy;

        // Account for velocity when finding snap point
        const { snapY, snapIndex } = findClosestSnapPoint(currentY + velocity * 100);

        Animated.spring(translateY, {
          toValue: snapY,
          useNativeDriver: true,
          damping: springConfig.damping ?? DEFAULT_SPRING_CONFIG.damping,
          stiffness: springConfig.stiffness ?? DEFAULT_SPRING_CONFIG.stiffness,
        }).start();

        onSnapChange?.(snapIndex);
      },
    })
  ).current;

  // Animate sheet in to default snap point
  const animateIn = useCallback(() => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT * (1 - defaultSnap),
      useNativeDriver: true,
      damping: springConfig.damping ?? DEFAULT_SPRING_CONFIG.damping,
      stiffness: springConfig.stiffness ?? DEFAULT_SPRING_CONFIG.stiffness,
    }).start();
  }, [translateY, defaultSnap, springConfig]);

  // Animate to specific snap point
  const snapTo = useCallback(
    (snapIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(snapPoints.length - 1, snapIndex));
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT * (1 - snapPoints[clampedIndex]),
        useNativeDriver: true,
        damping: springConfig.damping ?? DEFAULT_SPRING_CONFIG.damping,
        stiffness: springConfig.stiffness ?? DEFAULT_SPRING_CONFIG.stiffness,
      }).start();
      onSnapChange?.(clampedIndex);
    },
    [translateY, snapPoints, springConfig, onSnapChange]
  );

  // Animate sheet out (off screen)
  const animateOut = useCallback(() => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      damping: springConfig.damping ?? DEFAULT_SPRING_CONFIG.damping,
      stiffness: springConfig.stiffness ?? DEFAULT_SPRING_CONFIG.stiffness,
    }).start();
  }, [translateY, springConfig]);

  return {
    translateY,
    panHandlers: panResponder.panHandlers,
    animateIn,
    snapTo,
    animateOut,
  };
}

export default useDraggableSheet;
