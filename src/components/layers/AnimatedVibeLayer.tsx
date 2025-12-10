/**
 * AnimatedVibeLayer - The Complete Visual Layer
 *
 * Combines:
 * - Background shader (VibeMatrixAnimated) - 1 of 10 based on party + mode
 * - Orb (AbbyOrbUnified) - Single shader that MORPHS between energy states
 * - All driven by VibeController store
 *
 * This is the "Glass Sandwich" L0 + L1:
 * - L0: VibeMatrix background
 * - L1: Abby orb (centered or docked)
 *
 * The orb's alpha-glow naturally tints the background through
 * GPU framebuffer compositing (reverse chameleon effect).
 *
 * Orb Energy MORPHING (not switching):
 * - CALM (energy=0.0): Contained, slow, domain-warped lava texture
 * - ENGAGED (energy=0.5): More blob drift, medium speed
 * - EXCITED (energy=1.0): Free-flowing blobs, fast, no boundary
 *
 * All transitions are smooth GPU-side interpolations via the `energy` uniform.
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  VibeMatrixAnimated,
  VibeMatrixAnimatedRef,
} from './VibeMatrixAnimated';
import { AbbyOrbUnified } from './AbbyOrbUnified';
import {
  useVibeController,
  useVibeColors,
} from '../../store/useVibeController';
import { OrbEnergy } from '../../types/vibe';

// Map OrbEnergy to numeric value for shader
const ENERGY_VALUES: Record<OrbEnergy, number> = {
  CALM: 0.0,
  ENGAGED: 0.5,
  EXCITED: 1.0,
};

interface AnimatedVibeLayerProps {
  // Hide orb entirely
  hideOrb?: boolean;
  // Show background only
  backgroundOnly?: boolean;
  // Show debug overlay with current state
  showDebug?: boolean;
}

export const AnimatedVibeLayer: React.FC<AnimatedVibeLayerProps> = ({
  hideOrb = false,
  backgroundOnly = false,
  showDebug = false,
}) => {
  // Refs for imperative control
  const backgroundRef = useRef<VibeMatrixAnimatedRef>(null);

  // Subscribe to vibe state
  const colors = useVibeColors();
  const colorTheme = useVibeController((state) => state.colorTheme);
  const complexity = useVibeController((state) => state.complexity);
  const orbEnergy = useVibeController((state) => state.orbEnergy);
  const activeParty = useVibeController((state) => state.activeParty);
  const activeMode = useVibeController((state) => state.activeMode);
  const audioLevel = useVibeController((state) => state.audioLevel);

  // Convert orbEnergy enum to numeric value for shader
  const energyValue = ENERGY_VALUES[orbEnergy];

  // Log state changes for debugging
  useEffect(() => {
    console.log(`[AnimatedVibeLayer] State: party=${activeParty} mode=${activeMode} theme=${colorTheme} complexity=${complexity} orbEnergy=${orbEnergy} (${energyValue})`);
  }, [activeParty, activeMode, colorTheme, complexity, orbEnergy, energyValue]);

  // Update background when vibe changes
  useEffect(() => {
    if (backgroundRef.current) {
      backgroundRef.current.setVibeAndComplexity(colorTheme, complexity);
    }
  }, [colorTheme, complexity]);

  if (backgroundOnly) {
    return (
      <View style={styles.container}>
        <VibeMatrixAnimated
          ref={backgroundRef}
          initialTheme={colorTheme}
          initialComplexity={complexity}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* L0: Background */}
      <VibeMatrixAnimated
        ref={backgroundRef}
        initialTheme={colorTheme}
        initialComplexity={complexity}
      />

      {/* L1: Unified Orb - morphs between energy states */}
      {!hideOrb && (
        <AbbyOrbUnified
          audioLevel={audioLevel}
          energy={energyValue}
          colorA={colors.colorA as [number, number, number]}
          colorB={colors.colorB as [number, number, number]}
        />
      )}

      {/* Debug overlay */}
      {showDebug && (
        <View style={styles.debugOverlay} pointerEvents="none">
          <Text style={styles.debugText}>
            Party: {activeParty}
          </Text>
          <Text style={styles.debugText}>
            Mode: {activeMode}
          </Text>
          <Text style={styles.debugText}>
            Theme: {colorTheme}
          </Text>
          <Text style={styles.debugText}>
            Complexity: {complexity}
          </Text>
          <Text style={styles.debugText}>
            Orb: {orbEnergy} (energy={energyValue.toFixed(1)})
          </Text>
          <Text style={styles.debugText}>
            Audio: {audioLevel.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  debugOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default AnimatedVibeLayer;
