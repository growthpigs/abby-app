/**
 * Shader Factory - Composes shaders from reusable components
 *
 * Eliminates ~1,300 lines of duplicated noise code across 18 shaders.
 *
 * Usage:
 *   import { createShader, SHADER_PRESETS } from './factory';
 *
 *   // Generate shader from preset
 *   const shader = createShader(SHADER_PRESETS.LIQUID_MARBLE);
 *
 *   // Or customize
 *   const custom = createShader({
 *     ...SHADER_PRESETS.DOMAIN_WARP,
 *     time: { scale: 0.0005 },
 *   });
 */

import type { ShaderConfig, VignetteConfig, RGB } from './types';
import { DEFAULT_VIGNETTE, DEFAULT_TIME } from './types';
import { getNoiseCode, TURBULENCE } from './noise';

// Import all effects
import { DOMAIN_WARP_EFFECT } from './effects/domainWarp';
import { DOMAIN_WARP_TIEDYE_EFFECT } from './effects/domainWarpTiedye';
import { MULTI_SWIRL_EFFECT } from './effects/multiSwirl';
import { AURORA_SPIRALS_EFFECT } from './effects/auroraSpirals';
import { CELLULAR_EFFECT } from './effects/cellular';
import { LIQUID_MARBLE_EFFECT } from './effects/liquidMarble';
import { KALEIDOSCOPE_EFFECT } from './effects/kaleidoscope';
import { FLOWING_STREAMS_EFFECT } from './effects/flowingStreams';
import { RADIAL_FLOW_EFFECT } from './effects/radialFlow';
import { METABALLS_EFFECT } from './effects/metaballs';
import { CHROMATIC_BLOOM_EFFECT } from './effects/chromaticBloom';
import { LAYERED_ORBS_EFFECT } from './effects/layeredOrbs';
import { STIPPLED_EFFECT } from './effects/stippled';
import { BREATHING_NEBULA_EFFECT } from './effects/breathingNebula';
import { MAGNETIC_FIELD_EFFECT } from './effects/magneticField';
import { CRYSTALLINE_EFFECT } from './effects/crystalline';
import { INK_BLOOM_EFFECT } from './effects/inkBloom';
import { CELLULAR_MEMBRANE_EFFECT } from './effects/cellularMembrane';
import { AURORA_CURTAINS_EFFECT } from './effects/auroraCurtains';

import type { EffectType } from './types';
import type { EffectDefinition } from './effects/index';

/** Effect lookup table */
const EFFECT_MAP: Record<EffectType, EffectDefinition> = {
  domain_warp: DOMAIN_WARP_EFFECT,
  domain_warp_tiedye: DOMAIN_WARP_TIEDYE_EFFECT,
  multi_swirl: MULTI_SWIRL_EFFECT,
  aurora_spirals: AURORA_SPIRALS_EFFECT,
  cellular: CELLULAR_EFFECT,
  liquid_marble: LIQUID_MARBLE_EFFECT,
  kaleidoscope: KALEIDOSCOPE_EFFECT,
  flowing_streams: FLOWING_STREAMS_EFFECT,
  radial_flow: RADIAL_FLOW_EFFECT,
  metaballs: METABALLS_EFFECT,
  chromatic_bloom: CHROMATIC_BLOOM_EFFECT,
  layered_orbs: LAYERED_ORBS_EFFECT,
  stippled: STIPPLED_EFFECT,
  breathing_nebula: BREATHING_NEBULA_EFFECT,
  magnetic_field: MAGNETIC_FIELD_EFFECT,
  crystalline: CRYSTALLINE_EFFECT,
  ink_bloom: INK_BLOOM_EFFECT,
  cellular_membrane: CELLULAR_MEMBRANE_EFFECT,
  aurora_curtains: AURORA_CURTAINS_EFFECT,
};

/** Convert RGB array to GLSL float3 */
function rgbToGlsl(rgb: RGB): string {
  return `float3(${rgb[0].toFixed(2)}, ${rgb[1].toFixed(2)}, ${rgb[2].toFixed(2)})`;
}

/** Generate color constant declarations */
function generateColorConstants(palette: Record<string, RGB>): string {
  return Object.entries(palette)
    .map(([name, rgb]) => `const float3 ${name} = ${rgbToGlsl(rgb)};`)
    .join('\n');
}

/** Generate uniform declarations */
function generateUniforms(config: ShaderConfig): string {
  const uniforms = [
    'uniform float u_time;',
    'uniform float2 u_resolution;',
    'uniform float u_complexity;',
  ];

  if (config.useUniformColors) {
    uniforms.push(
      'uniform float3 u_colorA;',
      'uniform float3 u_colorB;',
      'uniform float3 u_colorC;'
    );
  }

  return uniforms.join('\n');
}

/** Generate vignette post-processing code */
function generateVignette(config: Partial<VignetteConfig> = {}): string {
  const v = { ...DEFAULT_VIGNETTE, ...config };
  return `
  // Vignette
  float2 vignetteUV = xy / u_resolution;
  float vignette = 1.0 - length((vignetteUV - 0.5) * ${v.strength.toFixed(1)});
  vignette = smoothstep(0.0, ${v.smoothness.toFixed(1)}, vignette);
  color *= half(${v.baseBrightness.toFixed(2)} + ${v.brightnessBoost.toFixed(2)} * vignette);
`;
}

/** Generate the main function wrapper */
function generateMain(
  config: ShaderConfig,
  effectMain: string,
  vignette: string
): string {
  const timeScale = config.time?.scale ?? DEFAULT_TIME.scale;

  return `
half4 main(float2 xy) {
  // Normalize coordinates
  float2 uv = xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  // Time with configurable scale
  float time = u_time * ${timeScale};

  // Effect-specific code
${effectMain}

${vignette}

  return half4(color, 1.0);
}
`;
}

/**
 * Create a complete shader from configuration
 *
 * @param config - Shader configuration
 * @returns Complete GLSL shader source string
 */
export function createShader(config: ShaderConfig): string {
  const effect = EFFECT_MAP[config.effect];
  if (!effect) {
    throw new Error(`Unknown effect type: ${config.effect}`);
  }

  // Build shader parts
  const uniforms = generateUniforms(config);
  const noiseCode = getNoiseCode(config.noise);
  const colorConstants = generateColorConstants(config.palette.colors);
  const vignette = generateVignette(config.vignette);
  const main = generateMain(config, effect.main, vignette);

  // Check if effect needs turbulence
  const needsTurbulence =
    config.effect === 'liquid_marble' || effect.helpers.includes('turbulence');

  // Compose final shader
  const parts = [
    '// Generated by ShaderFactory',
    `// Effect: ${config.name}`,
    '',
    '// Uniforms',
    uniforms,
    '',
    '// Color Palette',
    colorConstants,
    '',
    noiseCode,
    needsTurbulence ? TURBULENCE : '',
    '',
    '// Effect Helpers',
    effect.helpers,
    '',
    '// Main',
    main,
  ];

  return parts.filter(Boolean).join('\n');
}

/**
 * Wrap shader source in template literal for export
 */
export function wrapShaderSource(source: string): string {
  return '`' + source + '`';
}

// Re-export types
export type { ShaderConfig, EffectType, VignetteConfig, RGB } from './types';
export { DEFAULT_VIGNETTE, DEFAULT_TIME } from './types';
