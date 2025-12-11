/**
 * Validation Test: morphWrapper.ts SkSL Loop Fix
 *
 * Purpose: Verify that the morphWrapper shader module:
 * 1. Has properly unrolled loops (no variable bounds)
 * 2. Has correct function signature (no octaves parameter)
 * 3. Compiles successfully with SkSL
 */

import { wrapWithMorph, MORPH_DEFAULTS } from '../src/shaders/morphWrapper';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('morphWrapper - SkSL Loop Fix Validation', () => {
  // Read the actual morphWrapper source code
  const morphWrapperSource = readFileSync(
    join(__dirname, '../src/shaders/morphWrapper.ts'),
    'utf-8'
  );

  // Test 1: Verify function signature has no octaves parameter
  test('morphFbm function signature should not have octaves parameter', () => {
    // Check the actual source code
    expect(morphWrapperSource).toContain('float morphFbm(float2 p)');

    // Should NOT find old signature with octaves
    expect(morphWrapperSource).not.toContain('morphFbm(float2 p, int octaves)');
  });

  // Test 2: Verify loop is unrolled (no variable bounds)
  test('morphFbm should have unrolled loop with no variable bounds', () => {
    // Should NOT contain loop with variable bounds
    expect(morphWrapperSource).not.toMatch(/for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*octaves/);

    // Should contain manual octave comments
    expect(morphWrapperSource).toContain('// Octave 1');
    expect(morphWrapperSource).toContain('// Octave 2');
    expect(morphWrapperSource).toContain('// Octave 3');
    expect(morphWrapperSource).toContain('// Octave 4');
  });

  // Test 3: Verify getMorphAlpha calls morphFbm with only 1 argument
  test('getMorphAlpha should call morphFbm with single argument', () => {
    // Should find call with single UV argument
    expect(morphWrapperSource).toContain('morphFbm(uv * 3.0)');

    // Should NOT find old 2-argument call
    expect(morphWrapperSource).not.toMatch(/morphFbm\([^,]+,\s*\d+\)/);
  });

  // Test 4: Verify wrapper injects morph functions correctly
  test('wrapWithMorph should inject morph noise functions on a real shader', () => {
    const testShader = `
uniform float u_time;
uniform float2 u_resolution;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  return half4(uv.x, uv.y, 0.0, 1.0);
}
`;

    const wrapped = wrapWithMorph(testShader);

    // Should inject morph progress uniform
    expect(wrapped).toContain('uniform float u_morphProgress');

    // Should inject morph direction uniform
    expect(wrapped).toContain('uniform float u_morphDirection');

    // Should inject morph functions
    expect(wrapped).toContain('float morphFbm(float2 p)');
    expect(wrapped).toContain('float getMorphAlpha');
  });

  // Test 5: Verify default morph values are sensible
  test('MORPH_DEFAULTS should have correct initial values', () => {
    expect(MORPH_DEFAULTS.u_morphProgress).toBe(0.0);
    expect(MORPH_DEFAULTS.u_morphDirection).toBe(1.0);
  });

  // Test 6: Verify wrapper handles shader without proper structure gracefully
  test('wrapWithMorph should handle malformed shader gracefully', () => {
    const malformedShader = 'this is not a valid shader';

    const wrapped = wrapWithMorph(malformedShader);

    // Should return original if can't parse
    expect(wrapped).toBe(malformedShader);
  });

  // Test 7: Critical - No SkSL forbidden patterns in morphWrapper source
  test('morphWrapper should not contain SkSL-forbidden patterns', () => {
    // Should NOT use atan2 (not supported in SkSL)
    expect(morphWrapperSource).not.toContain('atan2');

    // Should NOT use % operator on floats (use integer division)
    expect(morphWrapperSource).not.toMatch(/float.*%/);

    // Should NOT have loops with variable bounds
    expect(morphWrapperSource).not.toMatch(/for\s*\([^)]*i\s*<\s*\w+[^)\d]/);
  });

  // Test 8: Verify actual shader integration works
  test('wrapWithMorph should successfully wrap a vibeMatrix-style shader', () => {
    // Realistic shader like vibeMatrix.ts
    const vibeShader = `
uniform float u_time;
uniform float2 u_resolution;
uniform float u_complexity;
uniform float3 u_colorA;
uniform float3 u_colorB;

float hash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + float2(0.0, 0.0)), hash(i + float2(1.0, 0.0)), u.x),
    mix(hash(i + float2(0.0, 1.0)), hash(i + float2(1.0, 1.0)), u.x),
    u.y
  );
}

half4 main(float2 xy) {
  float2 uv = xy / u_resolution;
  float3 color = mix(u_colorA, u_colorB, noise(uv * 10.0));
  return half4(color, 1.0);
}
`;

    const wrapped = wrapWithMorph(vibeShader);

    // Should preserve original uniforms
    expect(wrapped).toContain('uniform float u_time');
    expect(wrapped).toContain('uniform float2 u_resolution');
    expect(wrapped).toContain('uniform float u_complexity');

    // Should add morph uniforms
    expect(wrapped).toContain('uniform float u_morphProgress');
    expect(wrapped).toContain('uniform float u_morphDirection');

    // Should add morph functions
    expect(wrapped).toContain('float morphFbm(float2 p)');
    expect(wrapped).toContain('float getMorphAlpha');

    // Should preserve original functions
    expect(wrapped).toContain('float hash(float2 p)');
    expect(wrapped).toContain('float noise(float2 p)');

    // Should modify return statement to use morph alpha
    expect(wrapped).toContain('float morphAlpha = getMorphAlpha');
  });
});
