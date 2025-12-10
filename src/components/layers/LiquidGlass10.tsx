/**
 * LiquidGlass10 - Domain Warped Lava Orb
 *
 * Viscous, lava-lamp style orb using domain warping (fBM).
 * Hot yellow core → pink → purple → indigo edges.
 * Slow, hypnotic motion with soft spherical masking.
 */

import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  useClock,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

const LIQUID_GLASS_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 resolution;
  uniform float time;

  // Simple hash-based noise (SkSL compatible)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  // Smooth 3D noise
  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash3(i);
    float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
    float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
    float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
    float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
    float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
    float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
    float n111 = hash3(i + vec3(1.0, 1.0, 1.0));

    float n00 = mix(n000, n001, f.z);
    float n01 = mix(n010, n011, f.z);
    float n10 = mix(n100, n101, f.z);
    float n11 = mix(n110, n111, f.z);

    float n0 = mix(n00, n01, f.y);
    float n1 = mix(n10, n11, f.y);

    return mix(n0, n1, f.x);
  }

  // fBM for richer texture
  float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amp * noise3D(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return value;
  }

  vec4 main(vec2 fragCoord) {
    // Normalize UVs to -1 to 1, centered
    vec2 uv = (fragCoord * 2.0 - resolution) / min(resolution.x, resolution.y);

    float t = time * 0.25; // Slow, hypnotic

    // === SPHERICAL SDF ===
    float dist = length(uv);

    // Soft rotation for dreamy effect
    float rotAngle = t * 0.1;
    float co = cos(rotAngle);
    float si = sin(rotAngle);
    vec2 rotUV = vec2(uv.x * co - uv.y * si, uv.x * si + uv.y * co);

    // === DOMAIN WARPING ===
    // Layer 1: Base movement
    vec3 p1 = vec3(rotUV * 1.5 + vec2(t * 0.2, t * 0.3), t * 0.15);
    float noise1 = fbm(p1);

    // Layer 2: Warp the coordinates using noise1
    vec2 warpedUV = rotUV + (noise1 - 0.5) * 0.8;
    vec3 p2 = vec3(warpedUV * 2.0, t * 0.2);
    float noise2 = fbm(p2);

    // Layer 3: Additional detail warp
    vec2 warpedUV2 = warpedUV + (noise2 - 0.5) * 0.5;
    vec3 p3 = vec3(warpedUV2 * 1.2, t * 0.1);
    float noise3 = fbm(p3);

    // Combined noise value (0 to 1 range)
    float n = noise2 * 0.6 + noise3 * 0.4;

    // === COLOR PALETTE ===
    // #FDE047 (Bright Yellow)  = vec3(0.992, 0.878, 0.278)
    // #F472B6 (Hot Pink)       = vec3(0.957, 0.447, 0.714)
    // #A855F7 (Purple)         = vec3(0.659, 0.333, 0.969)
    // #6366F1 (Indigo)         = vec3(0.388, 0.400, 0.945)

    vec3 yellow = vec3(0.992, 0.878, 0.278);
    vec3 pink = vec3(0.957, 0.447, 0.714);
    vec3 purple = vec3(0.659, 0.333, 0.969);
    vec3 indigo = vec3(0.388, 0.400, 0.945);

    // Smooth color gradient based on noise
    vec3 color = mix(indigo, purple, smoothstep(0.0, 0.35, n));
    color = mix(color, pink, smoothstep(0.25, 0.6, n));
    color = mix(color, yellow, smoothstep(0.55, 0.85, n));

    // === ADDITIVE CORE GLOW ===
    // Hot center that adds brightness
    float centerGlow = smoothstep(0.5, 0.0, dist);
    float coreIntensity = smoothstep(0.6, 0.9, n) * centerGlow;
    color += yellow * coreIntensity * 0.6;

    // Extra bright hotspot at very center
    float hotspot = smoothstep(0.2, 0.0, dist);
    color += vec3(1.0, 0.95, 0.8) * hotspot * smoothstep(0.7, 1.0, n) * 0.4;

    // === SPHERICAL MASK ===
    // Soft edge falloff (heavy smoothstep for blur effect)
    float sphereRadius = 0.65;
    float edgeSoftness = 0.25;
    float alpha = 1.0 - smoothstep(sphereRadius - edgeSoftness, sphereRadius + edgeSoftness * 0.5, dist);

    // Fade colors toward edge
    float edgeFade = smoothstep(sphereRadius, 0.0, dist);
    color = mix(indigo * 0.5, color, edgeFade);

    // === TRANSPARENCY ===
    // Outer glow extends alpha slightly beyond sphere
    float outerGlow = smoothstep(sphereRadius + 0.3, sphereRadius, dist);
    vec3 glowColor = mix(indigo, purple, 0.5) * 0.3;

    // Final alpha: sphere + soft glow falloff
    float finalAlpha = alpha + outerGlow * 0.2;

    // Add glow to color
    vec3 finalColor = color + glowColor * outerGlow * (1.0 - alpha);

    return vec4(finalColor, finalAlpha);
  }
`);

export const LiquidGlass10: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClock();

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: clock.value / 1000,
  }), [clock]);

  if (!LIQUID_GLASS_SHADER) {
    return null;
  }

  return (
    <Canvas style={styles.canvas} mode="continuous">
      <Fill>
        <Shader source={LIQUID_GLASS_SHADER} uniforms={uniforms} />
      </Fill>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default LiquidGlass10;
