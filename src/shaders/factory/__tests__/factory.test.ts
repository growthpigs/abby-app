/**
 * Shader Factory Tests
 *
 * Verifies that the factory generates valid shader code
 * that matches the structure of the original shaders.
 */

import { createShader } from '../index';
import { SHADER_PRESETS, PRESETS } from '../presets';
import { getShaderById, SHADER_REGISTRY, getAllShaders } from '../registryV2';

describe('ShaderFactory', () => {
  describe('createShader', () => {
    it('should generate shader with all required sections', () => {
      const shader = createShader(PRESETS.LIQUID_MARBLE);

      // Check for required uniforms
      expect(shader).toContain('uniform float u_time');
      expect(shader).toContain('uniform float2 u_resolution');
      expect(shader).toContain('uniform float u_complexity');

      // Check for noise functions
      expect(shader).toContain('float snoise(float2 v)');
      expect(shader).toContain('float fbm(float2 p');

      // Check for main function
      expect(shader).toContain('half4 main(float2 xy)');

      // Check for vignette
      expect(shader).toContain('vignette');
    });

    it('should include color constants for non-uniform shaders', () => {
      const shader = createShader(PRESETS.LIQUID_MARBLE);

      expect(shader).toContain('COLOR_NAVY');
      expect(shader).toContain('COLOR_GOLD');
      expect(shader).toContain('COLOR_CREAM');
      expect(shader).toContain('COLOR_ROSE');
    });

    it('should include uniform colors when configured', () => {
      const shader = createShader(PRESETS.DOMAIN_WARP);

      expect(shader).toContain('uniform float3 u_colorA');
      expect(shader).toContain('uniform float3 u_colorB');
      expect(shader).toContain('uniform float3 u_colorC');
    });
  });

  describe('SHADER_PRESETS', () => {
    it('should have all 19 presets (0-18)', () => {
      expect(Object.keys(SHADER_PRESETS)).toHaveLength(19);

      for (let i = 0; i <= 18; i++) {
        expect(SHADER_PRESETS[i]).toBeDefined();
        expect(SHADER_PRESETS[i].id).toBe(i);
      }
    });

    it('should have unique names for all presets', () => {
      const names = Object.values(SHADER_PRESETS).map(p => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('registryV2', () => {
    it('should have same interface as original registry', () => {
      // Test getShaderById
      const shader = getShaderById(5);
      expect(shader).toBeDefined();
      expect(shader.id).toBe(5);
      expect(shader.name).toBe('LIQUID_MARBLE');
      expect(typeof shader.source).toBe('string');
      expect(shader.source.length).toBeGreaterThan(100);

      // Test fallback
      const invalid = getShaderById(999);
      expect(invalid.id).toBe(0);
    });

    it('should return all shaders via getAllShaders', () => {
      const all = getAllShaders();
      expect(all).toHaveLength(19);
    });

    it('should have valid source for all shaders', () => {
      const all = getAllShaders();

      for (const shader of all) {
        expect(shader.source).toContain('half4 main');
        expect(shader.source).toContain('u_time');
        expect(shader.source).toContain('u_resolution');
      }
    });
  });

  describe('effect-specific features', () => {
    it('should include domain warping for domain_warp effect', () => {
      const shader = createShader(PRESETS.DOMAIN_WARP);
      expect(shader).toContain('domainWarp');
    });

    it('should include swirl for multi_swirl effect', () => {
      const shader = createShader(PRESETS.WARM_FIRE_SWIRLS);
      expect(shader).toContain('multiSwirl');
    });

    it('should include kaleidoscope transform', () => {
      const shader = createShader(PRESETS.KALEIDOSCOPE_BLOOM);
      expect(shader).toContain('kaleidoscope');
    });

    it('should include chromatic aberration for bloom', () => {
      const shader = createShader(PRESETS.CHROMATIC_BLOOM);
      expect(shader).toContain('aberration');
    });
  });

  describe('code reduction', () => {
    it('should share noise code across all shaders', () => {
      // All shaders should use the same snoise function
      const shader1 = createShader(PRESETS.LIQUID_MARBLE);
      const shader2 = createShader(PRESETS.KALEIDOSCOPE_BLOOM);
      const shader3 = createShader(PRESETS.CHROMATIC_BLOOM);

      // Extract the snoise function from each
      const extractSnoise = (s: string) => {
        const match = s.match(/float snoise\(float2 v\)[\s\S]*?return 130\.0/);
        return match ? match[0] : '';
      };

      const snoise1 = extractSnoise(shader1);
      const snoise2 = extractSnoise(shader2);
      const snoise3 = extractSnoise(shader3);

      // All should have identical noise functions
      expect(snoise1).toBe(snoise2);
      expect(snoise2).toBe(snoise3);
    });
  });
});
