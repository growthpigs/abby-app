/**
 * Shader Effects Index
 *
 * Each effect exports:
 * - helpers: Additional GLSL helper functions
 * - main: The main shader function (without half4 main wrapper)
 */

export { DOMAIN_WARP_EFFECT } from './domainWarp';
export { DOMAIN_WARP_TIEDYE_EFFECT } from './domainWarpTiedye';
export { MULTI_SWIRL_EFFECT } from './multiSwirl';
export { AURORA_SPIRALS_EFFECT } from './auroraSpirals';
export { CELLULAR_EFFECT } from './cellular';
export { LIQUID_MARBLE_EFFECT } from './liquidMarble';
export { KALEIDOSCOPE_EFFECT } from './kaleidoscope';
export { FLOWING_STREAMS_EFFECT } from './flowingStreams';
export { RADIAL_FLOW_EFFECT } from './radialFlow';
export { METABALLS_EFFECT } from './metaballs';
export { CHROMATIC_BLOOM_EFFECT } from './chromaticBloom';
export { LAYERED_ORBS_EFFECT } from './layeredOrbs';
export { STIPPLED_EFFECT } from './stippled';
export { BREATHING_NEBULA_EFFECT } from './breathingNebula';
export { MAGNETIC_FIELD_EFFECT } from './magneticField';
export { CRYSTALLINE_EFFECT } from './crystalline';
export { INK_BLOOM_EFFECT } from './inkBloom';
export { CELLULAR_MEMBRANE_EFFECT } from './cellularMembrane';
export { AURORA_CURTAINS_EFFECT } from './auroraCurtains';

import type { EffectType } from '../types';

export interface EffectDefinition {
  helpers: string;
  main: string;
}

// Effect registry for dynamic lookup
export const EFFECTS: Record<EffectType, () => Promise<EffectDefinition>> = {
  domain_warp: async () => (await import('./domainWarp')).DOMAIN_WARP_EFFECT,
  domain_warp_tiedye: async () => (await import('./domainWarpTiedye')).DOMAIN_WARP_TIEDYE_EFFECT,
  multi_swirl: async () => (await import('./multiSwirl')).MULTI_SWIRL_EFFECT,
  aurora_spirals: async () => (await import('./auroraSpirals')).AURORA_SPIRALS_EFFECT,
  cellular: async () => (await import('./cellular')).CELLULAR_EFFECT,
  liquid_marble: async () => (await import('./liquidMarble')).LIQUID_MARBLE_EFFECT,
  kaleidoscope: async () => (await import('./kaleidoscope')).KALEIDOSCOPE_EFFECT,
  flowing_streams: async () => (await import('./flowingStreams')).FLOWING_STREAMS_EFFECT,
  radial_flow: async () => (await import('./radialFlow')).RADIAL_FLOW_EFFECT,
  metaballs: async () => (await import('./metaballs')).METABALLS_EFFECT,
  chromatic_bloom: async () => (await import('./chromaticBloom')).CHROMATIC_BLOOM_EFFECT,
  layered_orbs: async () => (await import('./layeredOrbs')).LAYERED_ORBS_EFFECT,
  stippled: async () => (await import('./stippled')).STIPPLED_EFFECT,
  breathing_nebula: async () => (await import('./breathingNebula')).BREATHING_NEBULA_EFFECT,
  magnetic_field: async () => (await import('./magneticField')).MAGNETIC_FIELD_EFFECT,
  crystalline: async () => (await import('./crystalline')).CRYSTALLINE_EFFECT,
  ink_bloom: async () => (await import('./inkBloom')).INK_BLOOM_EFFECT,
  cellular_membrane: async () => (await import('./cellularMembrane')).CELLULAR_MEMBRANE_EFFECT,
  aurora_curtains: async () => (await import('./auroraCurtains')).AURORA_CURTAINS_EFFECT,
};
