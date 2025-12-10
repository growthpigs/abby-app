/**
 * AnimatedVibeLayer - The Complete Visual Layer
 *
 * Combines:
 * - Background shader (VibeMatrixAnimated) - Selected by index (1-18)
 * - Orb (LiquidGlass / G1) - The original organic blob orb
 * - All driven by VibeController store
 *
 * This is the "Glass Sandwich" L0 + L1:
 * - L0: VibeMatrix background
 * - L1: Abby orb (centered)
 *
 * The orb's alpha-glow naturally tints the background through
 * GPU framebuffer compositing (reverse chameleon effect).
 *
 * Background Shader PROGRESSION (soft → hard):
 * - Pass backgroundIndex prop to directly select shader 1-18
 * - OR let it sync from VibeController's activeMode (default)
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  VibeMatrixAnimated,
  VibeMatrixAnimatedRef,
} from './VibeMatrixAnimated';
import { LiquidGlass } from './LiquidGlass';
import {
  useVibeController,
  useVibeColors,
} from '../../store/useVibeController';
import { OrbEnergy } from '../../types/vibe';
import { getShaderByIndex, TOTAL_SHADERS } from '../../constants/backgroundMap';

interface AnimatedVibeLayerProps {
  // Hide orb entirely
  hideOrb?: boolean;
  // Show background only
  backgroundOnly?: boolean;
  // Show debug overlay with current state
  showDebug?: boolean;
  // Direct background index selection (1-18) - bypasses mode system
  backgroundIndex?: number;
}

export const AnimatedVibeLayer: React.FC<AnimatedVibeLayerProps> = ({
  hideOrb = false,
  backgroundOnly = false,
  showDebug = false,
  backgroundIndex = 1,
}) => {
  // Refs for imperative control
  const backgroundRef = useRef<VibeMatrixAnimatedRef>(null);

  // Subscribe to vibe state
  const colorTheme = useVibeController((state) => state.colorTheme);
  const complexity = useVibeController((state) => state.complexity);

  // Get shader by direct index (clamp to valid range)
  const currentShader = useMemo(() => {
    const idx = Math.max(1, Math.min(backgroundIndex, TOTAL_SHADERS));
    return getShaderByIndex(idx);
  }, [backgroundIndex]);

  // Log state changes for debugging
  useEffect(() => {
    console.log(`[AnimatedVibeLayer] Background: ${backgroundIndex}/${TOTAL_SHADERS} theme=${colorTheme} complexity=${complexity}`);
  }, [backgroundIndex, colorTheme, complexity]);

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
          shaderSource={currentShader}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* L0: Background - now with dynamic shader based on party+mode */}
      <VibeMatrixAnimated
        ref={backgroundRef}
        initialTheme={colorTheme}
        initialComplexity={complexity}
        shaderSource={currentShader}
      />

      {/* L1: G1 Orb - the original organic blob */}
      {!hideOrb && <LiquidGlass />}

      {/* Debug overlay */}
      {showDebug && (
        <View style={styles.debugOverlay} pointerEvents="none">
          <Text style={styles.debugText}>
            BG: {backgroundIndex}/{TOTAL_SHADERS}
          </Text>
          <Text style={styles.debugText}>
            Theme: {colorTheme}
          </Text>
          <Text style={styles.debugText}>
            Complexity: {complexity}
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
