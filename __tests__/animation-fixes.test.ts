/**
 * Animation Fixes Test Suite
 *
 * Tests for the critical animation fixes applied on 2026-01-13.
 * Reference: GitHub Issue #2640 (useClock + useDerivedValue dependency array bug)
 *
 * These tests verify:
 * 1. useDerivedValue has no dependency array (would break animation)
 * 2. Canvas has mode="continuous" (required for 60fps)
 * 3. Speed multiplier is correct (3x increase)
 * 4. Shader registry returns expected presets
 */

import * as fs from 'fs';
import * as path from 'path';

const VIBE_MATRIX_PATH = path.join(__dirname, '../src/components/layers/VibeMatrixAnimated.tsx');
const DOMAIN_WARP_PATH = path.join(__dirname, '../src/shaders/factory/effects/domainWarp.ts');
const REGISTRY_PATH = path.join(__dirname, '../src/shaders/factory/registryV2.ts');

describe('Animation Fixes (GitHub Issue #2640)', () => {
  let vibeMatrixSource: string;
  let domainWarpSource: string;
  let registrySource: string;

  beforeAll(() => {
    vibeMatrixSource = fs.readFileSync(VIBE_MATRIX_PATH, 'utf-8');
    domainWarpSource = fs.readFileSync(DOMAIN_WARP_PATH, 'utf-8');
    registrySource = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  });

  describe('Fix 1: useDerivedValue Dependency Array', () => {
    it('should NOT have dependency array after useDerivedValue closure', () => {
      // The bug: useDerivedValue(() => {...}, [clock]) breaks animation
      // The fix: useDerivedValue(() => {...}) with NO dependency array

      // Find the uniforms useDerivedValue block
      const uniformsMatch = vibeMatrixSource.match(
        /const uniforms = useDerivedValue\(\(\) => \{[\s\S]*?\}\);/
      );

      expect(uniformsMatch).not.toBeNull();

      // Verify it ends with }); not }, [deps]);
      const uniformsBlock = uniformsMatch![0];
      expect(uniformsBlock).toMatch(/\}\);$/);
      expect(uniformsBlock).not.toMatch(/\}, \[.*\]\);$/);
    });

    it('should have critical comment explaining the fix', () => {
      expect(vibeMatrixSource).toContain('CRITICAL: NO dependency array');
      expect(vibeMatrixSource).toContain('GitHub Issue #2640');
    });
  });

  describe('Fix 2: Canvas mode="continuous"', () => {
    it('should have mode="continuous" on Canvas component', () => {
      expect(vibeMatrixSource).toContain('mode="continuous"');
    });

    it('should have explanatory comment for mode prop', () => {
      expect(vibeMatrixSource).toContain('mode="continuous" required for useClock');
    });
  });

  describe('Fix 3: Animation Speed', () => {
    it('should have 3x speed increase (0.15-0.5 range)', () => {
      // Original: mix(0.05, 0.25, u_complexity)
      // Fixed: mix(0.15, 0.5, u_complexity)
      expect(domainWarpSource).toContain('mix(0.15, 0.5, u_complexity)');
    });

    it('should NOT have old slow speed values', () => {
      expect(domainWarpSource).not.toContain('mix(0.05, 0.25');
    });

    it('should have comment explaining speed increase', () => {
      expect(domainWarpSource).toContain('increased 3x');
    });
  });

  describe('Fix 4: Shader Registry', () => {
    it('should export getAllShaders function', () => {
      expect(registrySource).toContain('export function getAllShaders');
    });

    it('should export getShaderById function', () => {
      expect(registrySource).toContain('export function getShaderById');
    });

    it('should have SHADER_REGISTRY with multiple entries', () => {
      const registryMatches = registrySource.match(/SHADER_REGISTRY\[/g);
      expect(registryMatches).not.toBeNull();
      expect(registryMatches!.length).toBeGreaterThanOrEqual(19);
    });
  });

  describe('Fallback Handling', () => {
    it('should have fallback gradient when shader is null', () => {
      expect(vibeMatrixSource).toContain('if (!shader)');
      expect(vibeMatrixSource).toContain('FALLBACK_COLORS');
      expect(vibeMatrixSource).toContain('LinearGradient');
    });

    it('should define FALLBACK_COLORS constant', () => {
      expect(vibeMatrixSource).toContain('const FALLBACK_COLORS');
    });
  });
});

describe('Type Safety', () => {
  it('should have type declaration for Canvas mode prop', () => {
    const typeDeclPath = path.join(__dirname, '../src/types/skia.d.ts');
    expect(fs.existsSync(typeDeclPath)).toBe(true);

    const typeDeclSource = fs.readFileSync(typeDeclPath, 'utf-8');
    expect(typeDeclSource).toContain("mode?: 'default' | 'continuous'");
  });
});

describe('Dev Guards', () => {
  it('should have __DEV__ guard on console statements in VibeMatrixAnimated', () => {
    const source = fs.readFileSync(VIBE_MATRIX_PATH, 'utf-8');
    const consoleMatches = source.match(/console\.(log|error|warn)/g);
    if (consoleMatches) {
      // Every console statement should be preceded by __DEV__ check
      const devGuardedConsoles = source.match(/if \(__DEV__\) console\./g);
      expect(devGuardedConsoles?.length).toBe(consoleMatches.length);
    }
  });
});
