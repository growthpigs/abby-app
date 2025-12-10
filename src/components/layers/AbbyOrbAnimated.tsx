/**
 * AbbyOrbAnimated - Animated Orb with Energy Transitions
 *
 * Wraps the orb shaders (G1/G2/G4) and provides:
 * - Cross-fade transitions between energy levels
 * - Synced colors with VibeController
 * - AudioLevel animation for speech
 *
 * Energy Levels:
 * - CALM (G4): Small glow, idle state
 * - ENGAGED (G2): Medium glow, user opening up
 * - EXCITED (G1): Large glow, exceptional moment
 *
 * NOTE: Currently only G4 supports colorA/colorB props.
 * G1/G2 will be updated later (CC2 task) to support vibe colors.
 * For now, we use G4 for all energy levels but adjust the visual
 * intensity through other means.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { LiquidGlass4 } from './LiquidGlass4';
import { useOrbState, useVibeController } from '../../store/useVibeController';
import { OrbEnergy, RGBColor } from '../../types/vibe';
import { ORB_ENERGY_MAP } from '../../constants/colors';

// Transition duration for cross-fades
const TRANSITION_DURATION = 600;

// Speaking pulse parameters
const PULSE_MIN = 0.3;
const PULSE_MAX = 0.8;
const PULSE_DURATION = 250; // ~2Hz

interface AbbyOrbAnimatedProps {
  // Override colors (optional - defaults to VibeController)
  colorA?: RGBColor;
  colorB?: RGBColor;
  // Override audio level (optional - defaults to VibeController)
  audioLevel?: number;
  // Size override
  size?: number;
}

export const AbbyOrbAnimated: React.FC<AbbyOrbAnimatedProps> = ({
  colorA: colorAOverride,
  colorB: colorBOverride,
  audioLevel: audioLevelOverride,
  size,
}) => {
  // Get state from controller
  const orbState = useOrbState();
  const isSpeakingPulseActive = useVibeController(
    (state) => state.isSpeakingPulseActive
  );

  // Use overrides or controller values
  // Default to TRUST blue if no colors available
  const defaultColorA: RGBColor = [0.23, 0.51, 0.96]; // TRUST primary
  const defaultColorB: RGBColor = [0.02, 0.71, 0.83]; // TRUST secondary

  const colorA = colorAOverride || orbState.colorA || defaultColorA;
  const colorB = colorBOverride || orbState.colorB || defaultColorB;
  const energy = orbState.energy;

  // Debug logging (DEV only - this runs on every render)
  if (__DEV__ && false) { // Disabled - too noisy
    console.log('[AbbyOrbAnimated] colorA:', colorA, 'colorB:', colorB);
  }

  // Animated audio level (for speaking pulse simulation)
  const animatedAudioLevel = useSharedValue(0);

  // Handle speaking pulse animation
  useEffect(() => {
    if (isSpeakingPulseActive) {
      // Create pulsing animation when Abby is speaking
      animatedAudioLevel.value = withRepeat(
        withSequence(
          withTiming(PULSE_MAX, {
            duration: PULSE_DURATION,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(PULSE_MIN, {
            duration: PULSE_DURATION,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      // Stop pulsing, return to idle
      cancelAnimation(animatedAudioLevel);
      animatedAudioLevel.value = withTiming(0, { duration: 300 });
    }
  }, [isSpeakingPulseActive]);

  // For now, just use a simple default audio level
  // The speaking pulse will be handled by the controller later
  const finalAudioLevel = audioLevelOverride ?? 0;

  // Energy level visual adjustments
  // Since G1/G2 don't have color props yet, we simulate energy
  // through opacity and scale of the G4 orb
  const energyScale = useSharedValue(1);
  const energyGlow = useSharedValue(1);

  useEffect(() => {
    // Adjust visual properties based on energy level
    switch (energy) {
      case 'CALM':
        energyScale.value = withTiming(1, { duration: TRANSITION_DURATION });
        energyGlow.value = withTiming(1, { duration: TRANSITION_DURATION });
        break;
      case 'ENGAGED':
        energyScale.value = withTiming(1.05, { duration: TRANSITION_DURATION });
        energyGlow.value = withTiming(1.2, { duration: TRANSITION_DURATION });
        break;
      case 'EXCITED':
        energyScale.value = withTiming(1.1, { duration: TRANSITION_DURATION });
        energyGlow.value = withTiming(1.4, { duration: TRANSITION_DURATION });
        break;
    }
  }, [energy]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: energyScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        size ? { width: size, height: size } : undefined,
        animatedContainerStyle,
      ]}
    >
      {/* Primary orb - G4 with vibe colors */}
      <LiquidGlass4
        audioLevel={finalAudioLevel}
        colorA={colorA as [number, number, number]}
        colorB={colorB as [number, number, number]}
      />

      {/*
        TODO: When G1/G2 get colorA/colorB props, add cross-fade layers:

        {energy === 'EXCITED' && (
          <Animated.View style={[styles.overlay, g1Style]}>
            <LiquidGlass colorA={colorA} colorB={colorB} />
          </Animated.View>
        )}

        {energy === 'ENGAGED' && (
          <Animated.View style={[styles.overlay, g2Style]}>
            <LiquidGlass2 colorA={colorA} colorB={colorB} />
          </Animated.View>
        )}
      */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignSelf: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default AbbyOrbAnimated;
