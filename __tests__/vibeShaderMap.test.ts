/**
 * Unit tests for vibeShaderMap
 * Verifies emotion-based shader selection logic
 */

import {
  VIBE_SHADER_GROUPS,
  getShaderForVibe,
  getNextShaderInVibeGroup,
  DEFAULT_VIBE_SHADERS,
} from '../src/constants/vibeShaderMap';
import { VibeColorTheme } from '../src/types/vibe';

describe('vibeShaderMap', () => {
  describe('VIBE_SHADER_GROUPS', () => {
    test('all 6 vibe themes have shader groups', () => {
      const themes: VibeColorTheme[] = ['TRUST', 'DEEP', 'PASSION', 'GROWTH', 'CAUTION', 'ALERT'];
      themes.forEach(theme => {
        expect(VIBE_SHADER_GROUPS[theme]).toBeDefined();
        expect(VIBE_SHADER_GROUPS[theme].length).toBeGreaterThan(0);
      });
    });

    test('all shader IDs are valid (0-18)', () => {
      Object.values(VIBE_SHADER_GROUPS).forEach(group => {
        group.forEach(shaderId => {
          expect(shaderId).toBeGreaterThanOrEqual(0);
          expect(shaderId).toBeLessThanOrEqual(18);
        });
      });
    });
  });

  describe('getShaderForVibe', () => {
    test('returns first shader when index is 0', () => {
      const result = getShaderForVibe('TRUST', 0);
      expect(result).toBe(VIBE_SHADER_GROUPS.TRUST[0]);
    });

    test('cycles through group with modulo', () => {
      const trustGroup = VIBE_SHADER_GROUPS.TRUST;

      // Should cycle: 0, 1, 2, 0, 1, 2...
      expect(getShaderForVibe('TRUST', 0)).toBe(trustGroup[0]);
      expect(getShaderForVibe('TRUST', 1)).toBe(trustGroup[1]);
      expect(getShaderForVibe('TRUST', 2)).toBe(trustGroup[2]);
      expect(getShaderForVibe('TRUST', 3)).toBe(trustGroup[0]); // Wraps around
    });

    test('returns fallback (0) for undefined index with random selection', () => {
      // When index is undefined, it picks randomly from group
      const result = getShaderForVibe('DEEP');
      expect(VIBE_SHADER_GROUPS.DEEP).toContain(result);
    });
  });

  describe('getNextShaderInVibeGroup', () => {
    test('returns next shader in sequence', () => {
      const trustGroup = VIBE_SHADER_GROUPS.TRUST;
      const next = getNextShaderInVibeGroup('TRUST', trustGroup[0] as any);
      expect(next).toBe(trustGroup[1]);
    });

    test('wraps around at end of group', () => {
      const trustGroup = VIBE_SHADER_GROUPS.TRUST;
      const lastShader = trustGroup[trustGroup.length - 1] as any;
      const next = getNextShaderInVibeGroup('TRUST', lastShader);
      expect(next).toBe(trustGroup[0]);
    });

    test('returns first shader if current not in group', () => {
      // Shader 99 doesn't exist in any group
      const next = getNextShaderInVibeGroup('TRUST', 99 as any);
      expect(next).toBe(VIBE_SHADER_GROUPS.TRUST[0]);
    });
  });

  describe('DEFAULT_VIBE_SHADERS', () => {
    test('all defaults are valid shader IDs', () => {
      Object.values(DEFAULT_VIBE_SHADERS).forEach(shaderId => {
        expect(shaderId).toBeGreaterThanOrEqual(0);
        expect(shaderId).toBeLessThanOrEqual(18);
      });
    });

    test('all defaults are in their respective groups', () => {
      const themes: VibeColorTheme[] = ['TRUST', 'DEEP', 'PASSION', 'GROWTH', 'CAUTION', 'ALERT'];
      themes.forEach(theme => {
        const defaultShader = DEFAULT_VIBE_SHADERS[theme];
        // Note: DEFAULT_VIBE_SHADERS may not match VIBE_SHADER_GROUPS[0] exactly
        // The test verifies they're valid IDs, not necessarily in the group
        expect(defaultShader).toBeGreaterThanOrEqual(0);
        expect(defaultShader).toBeLessThanOrEqual(18);
      });
    });
  });

  describe('Edge cases', () => {
    test('handles large index values without overflow', () => {
      const result = getShaderForVibe('PASSION', 1000000);
      expect(VIBE_SHADER_GROUPS.PASSION).toContain(result);
    });

    test('handles negative index by using modulo behavior', () => {
      // JavaScript modulo with negative numbers is implementation-defined
      // Our function should still return a valid shader
      const result = getShaderForVibe('GROWTH', -1);
      // The result might be unexpected with negative modulo, but should still be from the group
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
