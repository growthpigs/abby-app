/**
 * Shader Factory Type Definitions
 *
 * Provides type-safe configuration for generating SkSL shaders.
 */

/** RGB color as normalized floats (0-1) */
export type RGB = readonly [number, number, number];

/** Color palette configuration */
export interface ColorPalette {
  /** Named colors available in the shader (e.g., { primary: [0.9, 0.1, 0.1] }) */
  colors: Record<string, RGB>;
}

/** Noise algorithm type */
export type NoiseType = 'simplex' | 'hash' | 'both';

/** Time scaling configuration */
export interface TimeConfig {
  /** Multiplier for u_time (e.g., 0.00025 for slow, 0.001 for fast) */
  scale: number;
  /** Optional offset for time */
  offset?: number;
}

/** Vignette post-processing configuration */
export interface VignetteConfig {
  /** Strength of vignette effect (0-2, default 1.3) */
  strength: number;
  /** Smoothness of falloff (0-1, default 0.6) */
  smoothness: number;
  /** Base brightness (0-1, default 0.8) */
  baseBrightness: number;
  /** Brightness boost (0-1, default 0.2) */
  brightnessBoost: number;
}

/** Shader effect type */
export type EffectType =
  | 'domain_warp'
  | 'domain_warp_tiedye'
  | 'multi_swirl'
  | 'aurora_spirals'
  | 'cellular'
  | 'liquid_marble'
  | 'kaleidoscope'
  | 'flowing_streams'
  | 'radial_flow'
  | 'metaballs'
  | 'chromatic_bloom'
  | 'layered_orbs'
  | 'stippled'
  | 'breathing_nebula'
  | 'magnetic_field'
  | 'crystalline'
  | 'ink_bloom'
  | 'cellular_membrane'
  | 'aurora_curtains';

/** Effect-specific parameters */
export interface EffectParams {
  /** Number of swirl centers (for multi_swirl) */
  swirlCount?: number;
  /** Pattern scale multiplier */
  patternScale?: number;
  /** Turbulence intensity */
  turbulence?: number;
  /** Custom effect-specific params */
  [key: string]: number | boolean | string | undefined;
}

/** Complete shader configuration */
export interface ShaderConfig {
  /** Unique identifier */
  id: number;
  /** Human-readable name */
  name: string;
  /** Brief description */
  description: string;
  /** Fallback color if shader fails */
  fallbackColor: string;
  /** Type of noise to include */
  noise: NoiseType;
  /** Time configuration */
  time: TimeConfig;
  /** Color palette */
  palette: ColorPalette;
  /** Primary effect type */
  effect: EffectType;
  /** Effect-specific parameters */
  effectParams?: EffectParams;
  /** Vignette configuration (optional, uses defaults if omitted) */
  vignette?: Partial<VignetteConfig>;
  /** Whether to use uniform colors (u_colorA, u_colorB, u_colorC) vs const colors */
  useUniformColors?: boolean;
}

/** Shader fragment - a reusable piece of GLSL code */
export interface ShaderFragment {
  /** Fragment identifier */
  id: string;
  /** GLSL code */
  code: string;
  /** Dependencies on other fragments */
  dependencies?: string[];
}

/** Generated shader output */
export interface GeneratedShader {
  /** Shader source code */
  source: string;
  /** Configuration used to generate it */
  config: ShaderConfig;
}

/** Default vignette configuration */
export const DEFAULT_VIGNETTE: VignetteConfig = {
  strength: 1.3,
  smoothness: 0.6,
  baseBrightness: 0.8,
  brightnessBoost: 0.2,
};

/** Default time configuration */
export const DEFAULT_TIME: TimeConfig = {
  scale: 0.00025,
  offset: 0,
};
