/**
 * Morph Wrapper - Injects noise-based alpha blending into any shader
 *
 * Creates organic "ink spreading" transitions instead of uniform crossfade.
 * Uses fBM noise to determine per-pixel visibility threshold.
 *
 * Uniforms added:
 * - u_morphProgress: 0.0-1.0, transition progress
 * - u_morphDirection: 1.0 = fading in, -1.0 = fading out
 *
 * @see docs/features/vibematrix.md for technical details
 */

// fBM noise function for morph mask (injected into shader)
const MORPH_NOISE_FUNCTIONS = `
// === MORPH TRANSITION FUNCTIONS ===
// Generates organic noise pattern for per-pixel transition mask

float morphHash(float2 p) {
  return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
}

float morphNoise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);  // smoothstep

  return mix(
    mix(morphHash(i + float2(0.0, 0.0)), morphHash(i + float2(1.0, 0.0)), u.x),
    mix(morphHash(i + float2(0.0, 1.0)), morphHash(i + float2(1.0, 1.0)), u.x),
    u.y
  );
}

// SkSL requires constant loop bounds - hardcode 4 octaves
float morphFbm(float2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  // Octave 1
  value += amplitude * morphNoise(p * frequency);
  frequency *= 2.0;
  amplitude *= 0.5;
  // Octave 2
  value += amplitude * morphNoise(p * frequency);
  frequency *= 2.0;
  amplitude *= 0.5;
  // Octave 3
  value += amplitude * morphNoise(p * frequency);
  frequency *= 2.0;
  amplitude *= 0.5;
  // Octave 4
  value += amplitude * morphNoise(p * frequency);

  return value;
}

// Calculate morph alpha for this pixel
float getMorphAlpha(float2 xy, float2 resolution, float progress, float direction) {
  // Normalize coordinates for consistent noise across resolutions
  float2 uv = xy / min(resolution.x, resolution.y);

  // Scale for nice blob size (3.0 = medium blobs)
  float noise = morphFbm(uv * 3.0);

  // Edge softness - how wide the blend zone is
  float edge = 0.15;

  // Map progress to threshold that sweeps through noise range
  // We want mask to go 0→1 as progress goes 0→1
  // threshold goes from (1 + edge) down to (-edge)
  // So at progress=0: threshold high, noise < threshold, smoothstep=0
  // At progress=1: threshold low, noise > threshold, smoothstep=1
  float threshold = mix(1.0 + edge, -edge, progress);

  // Create soft edge blend
  float mask = smoothstep(threshold - edge, threshold + edge, noise);

  // Direction: 1.0 = fading in (growing: alpha follows mask 0→1)
  //           -1.0 = fading out (shrinking: alpha follows 1→0)
  return direction > 0.0 ? mask : (1.0 - mask);
}
// === END MORPH FUNCTIONS ===

`;

// Morph uniforms to inject after existing uniforms
const MORPH_UNIFORMS = `
uniform float u_morphProgress;   // 0.0 to 1.0 transition progress
uniform float u_morphDirection;  // 1.0 = fading in, -1.0 = fading out
`;

/**
 * Wraps a shader source with morph transition capability
 *
 * @param shaderSource - Original shader source code
 * @returns Modified shader with morph alpha support
 */
export function wrapWithMorph(shaderSource: string): string {
  // Find where uniforms end (look for first function definition)
  // Shaders typically have: uniforms, then function definitions, then main

  // Find the position after uniform declarations
  // Look for the first function (starts with "float", "half", "void", etc. followed by identifier and "(")
  const functionRegex = /\n(float[234]?|half[234]?|void|int)\s+\w+\s*\(/;
  const match = shaderSource.match(functionRegex);

  if (!match || match.index === undefined) {
    if (typeof __DEV__ !== "undefined" && __DEV__) console.error('[morphWrapper] Could not find function start in shader');
    return shaderSource;
  }

  // Detect the parameter name used in main() - could be 'xy' or 'fragCoord'
  // Pattern: half4 main(float2 <paramName>)
  const mainParamRegex = /half4\s+main\s*\(\s*float2\s+(\w+)\s*\)/;
  const mainMatch = shaderSource.match(mainParamRegex);
  const coordParam = mainMatch ? mainMatch[1] : 'xy'; // Default to 'xy' if not found

  const insertPosition = match.index;

  // Insert morph uniforms and functions after regular uniforms
  const beforeFunctions = shaderSource.slice(0, insertPosition);
  const afterUniforms = shaderSource.slice(insertPosition);

  // Now modify the main function to apply morph alpha
  // Find "return half4(" or "return float4(" and wrap it
  const modifiedShader = beforeFunctions +
    MORPH_UNIFORMS +
    MORPH_NOISE_FUNCTIONS +
    afterUniforms;

  // Replace the final return statement to apply morph alpha
  // Pattern 1: "return half4(color, 1.0);"
  // Pattern 2: "return half4(half3(color), 1.0);" (some shaders use float3 color)
  // Pattern 3: "return half4(half3(waterColor), 1.0);" (vibeMatrix4 uses waterColor)

  let finalShader = modifiedShader;

  // Pattern 1: half4(color, 1.0)
  finalShader = finalShader.replace(
    /return\s+half4\s*\(\s*color\s*,\s*[\d.]+\s*\)\s*;/g,
    `// Apply morph transition alpha
  float morphAlpha = getMorphAlpha(${coordParam}, u_resolution, u_morphProgress, u_morphDirection);
  return half4(color, half(morphAlpha));`
  );

  // Pattern 2: half4(half3(color), 1.0)
  finalShader = finalShader.replace(
    /return\s+half4\s*\(\s*half3\s*\(\s*color\s*\)\s*,\s*[\d.]+\s*\)\s*;/g,
    `// Apply morph transition alpha
  float morphAlpha = getMorphAlpha(${coordParam}, u_resolution, u_morphProgress, u_morphDirection);
  return half4(half3(color), half(morphAlpha));`
  );

  // Pattern 3: half4(half3(waterColor), 1.0) - vibeMatrix4 special case
  finalShader = finalShader.replace(
    /return\s+half4\s*\(\s*half3\s*\(\s*waterColor\s*\)\s*,\s*[\d.]+\s*\)\s*;/g,
    `// Apply morph transition alpha
  float morphAlpha = getMorphAlpha(${coordParam}, u_resolution, u_morphProgress, u_morphDirection);
  return half4(half3(waterColor), half(morphAlpha));`
  );

  // FRAGILE CODE SAFEGUARD: Warn if morph injection failed
  // The regex patterns above are brittle - if shader format changes, this catches it
  const morphInjected = finalShader.includes('getMorphAlpha');
  if (!morphInjected && typeof __DEV__ !== "undefined" && __DEV__) {
    console.warn(
      '[morphWrapper] MORPH INJECTION FAILED - shader return statement not recognized.\n' +
      'Expected patterns: half4(color, 1.0), half4(half3(color), 1.0), or half4(half3(waterColor), 1.0)\n' +
      'Transitions will NOT work. Check shader source format.'
    );
  }

  return finalShader;
}

/**
 * Default uniform values for non-transitioning state
 */
export const MORPH_DEFAULTS = {
  u_morphProgress: 0.0,
  u_morphDirection: 1.0,
};

export default wrapWithMorph;
