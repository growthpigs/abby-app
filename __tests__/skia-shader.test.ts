/**
 * Skia Shader System Tests
 *
 * Validates:
 * 1. Shader source code structure
 * 2. GLSL syntax patterns
 * 3. Uniform declarations
 * 4. Background mapping system
 * 5. VibeMatrixAnimated component
 */

import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, relativePath));
}

// ==============================================================================
// TEST 1: Shader Factory Structure
// ==============================================================================

describe('Shader Factory', () => {
  test('Factory index.ts exports createShader function', () => {
    const source = readFile('src/shaders/factory/index.ts');

    expect(source).toContain('export function createShader');
  });

  test('Generated shaders have required uniform declarations', () => {
    // Import the factory to test generated shaders
    const { getShaderById } = require('../src/shaders/factory/registryV2');
    const shader = getShaderById(0);

    // Required uniforms for animation and coloring
    expect(shader.source).toContain('u_time');
    expect(shader.source).toContain('u_resolution');
    expect(shader.source).toContain('u_complexity');
  });

  test('Generated shaders have main function', () => {
    const { getShaderById } = require('../src/shaders/factory/registryV2');
    const shader = getShaderById(5);

    // SkSL uses half4 main
    expect(shader.source).toContain('half4 main(');
  });

  test('Generated shaders use xy for position', () => {
    const { getShaderById } = require('../src/shaders/factory/registryV2');
    const shader = getShaderById(0);

    // Skia shaders receive coordinates as xy
    expect(shader.source).toContain('half4 main(float2 xy)');
  });
});

// ==============================================================================
// TEST 2: Shader Registry V2
// ==============================================================================

describe('Shader Registry V2', () => {
  test('Registry has all 19 presets (0-18)', () => {
    const { getAllShaders } = require('../src/shaders/factory/registryV2');
    const all = getAllShaders();
    expect(all).toHaveLength(19);
  });

  test('All shaders have valid source', () => {
    const { getAllShaders } = require('../src/shaders/factory/registryV2');
    const all = getAllShaders();

    all.forEach((shader: { source: string; name: string }) => {
      expect(shader.source).toContain('half4 main');
      expect(shader.source).toContain('u_time');
      expect(shader.source.length).toBeGreaterThan(100);
    });
  });

  test('getShaderById returns correct shader', () => {
    const { getShaderById } = require('../src/shaders/factory/registryV2');

    const shader5 = getShaderById(5);
    expect(shader5.id).toBe(5);
    expect(shader5.name).toBe('LIQUID_MARBLE');
  });

  test('getShaderById returns default for invalid ID', () => {
    const { getShaderById } = require('../src/shaders/factory/registryV2');

    const invalid = getShaderById(999);
    expect(invalid.id).toBe(0);
  });
});

// ==============================================================================
// TEST 3: Background Mapping System
// ==============================================================================

describe('Background Mapping', () => {
  test('backgroundMap.ts exists and has required exports', () => {
    expect(fileExists('src/constants/backgroundMap.ts')).toBe(true);

    const source = readFile('src/constants/backgroundMap.ts');
    expect(source).toContain('export const getShaderByIndex');
    expect(source).toContain('export const TOTAL_SHADERS');
  });

  test('getShaderByIndex returns valid shader source', () => {
    const { getShaderByIndex } = require('../src/constants/backgroundMap');

    const shader = getShaderByIndex(5);
    expect(typeof shader).toBe('string');
    expect(shader).toContain('half4 main');
  });

  test('TOTAL_SHADERS is 19', () => {
    const { TOTAL_SHADERS } = require('../src/constants/backgroundMap');

    expect(TOTAL_SHADERS).toBe(19);
  });

  test('backgroundMap imports from shader factory', () => {
    const source = readFile('src/constants/backgroundMap.ts');

    // Should import from factory
    expect(source).toContain("from '../shaders/factory/registryV2'");
  });
});

// ==============================================================================
// TEST 4: VibeMatrixAnimated Component
// ==============================================================================

describe('VibeMatrixAnimated Component', () => {
  test('VibeMatrixAnimated.tsx exists', () => {
    expect(fileExists('src/components/layers/VibeMatrixAnimated.tsx')).toBe(true);
  });

  test('VibeMatrixAnimated uses forwardRef for ref forwarding', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain('forwardRef');
    expect(source).toContain('useImperativeHandle');
  });

  test('VibeMatrixAnimated exports ref type', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain('export interface VibeMatrixAnimatedRef');
  });

  test('VibeMatrixAnimated has setVibeAndComplexity method', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain('setVibeAndComplexity');
  });

  test('VibeMatrixAnimated uses Skia components', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain("from '@shopify/react-native-skia'");
    expect(source).toContain('Canvas');
    expect(source).toContain('Shader');
  });

  test('VibeMatrixAnimated accepts shaderSource prop', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain('shaderSource');
    expect(source).toContain('RuntimeEffect.Make');
  });
});

// ==============================================================================
// TEST 5: Color System
// ==============================================================================

describe('Color System', () => {
  test('colors.ts exists with vibe color definitions', () => {
    expect(fileExists('src/constants/colors.ts')).toBe(true);

    const source = readFile('src/constants/colors.ts');
    expect(source).toContain('VIBE_COLORS');
  });

  test('All vibe themes have color definitions', () => {
    const source = readFile('src/constants/colors.ts');

    const themes = ['TRUST', 'PASSION', 'CAUTION', 'GROWTH', 'DEEP'];
    themes.forEach(theme => {
      expect(source).toContain(theme);
    });
  });

  test('Colors are normalized RGB (0-1 range)', () => {
    const source = readFile('src/constants/colors.ts');

    // Uses hexToRGB to convert to normalized values
    expect(source).toContain('hexToRGB');
    expect(source).toContain('/ 255');
  });

  test('COMPLEXITY_VALUES exists', () => {
    const source = readFile('src/constants/colors.ts');

    expect(source).toContain('COMPLEXITY_VALUES');
  });
});

// ==============================================================================
// TEST 6: Vibe Store Integration
// ==============================================================================

describe('Vibe Store', () => {
  test('useVibeStore exists', () => {
    expect(fileExists('src/store/useVibeStore.ts')).toBe(true);
  });

  test('useVibeStore has colorTheme state', () => {
    const source = readFile('src/store/useVibeStore.ts');

    expect(source).toContain('colorTheme');
    expect(source).toContain('setColorTheme');
  });

  test('useVibeStore has complexity state', () => {
    const source = readFile('src/store/useVibeStore.ts');

    expect(source).toContain('complexity');
    expect(source).toContain('setComplexity');
  });

  test('useVibeStore uses zustand', () => {
    const source = readFile('src/store/useVibeStore.ts');

    expect(source).toContain("from 'zustand'");
    expect(source).toContain('create');
  });
});

// ==============================================================================
// TEST 7: Vibe Controller
// ==============================================================================

describe('Vibe Controller', () => {
  test('useVibeController exists', () => {
    expect(fileExists('src/store/useVibeController.ts')).toBe(true);
  });

  test('useVibeController has APP_STATE_VIBES mapping', () => {
    const source = readFile('src/store/useVibeController.ts');

    expect(source).toContain('APP_STATE_VIBES');
    expect(source).toContain('COACH_INTRO');
    expect(source).toContain('INTERVIEW');
    expect(source).toContain('SEARCHING');
  });

  test('useVibeController has setFromAppState action', () => {
    const source = readFile('src/store/useVibeController.ts');

    expect(source).toContain('setFromAppState');
  });

  test('useVibeController has orbEnergy state', () => {
    const source = readFile('src/store/useVibeController.ts');

    expect(source).toContain('orbEnergy');
    expect(source).toContain('setOrbEnergy');
  });

  test('useVibeController has audioLevel state', () => {
    const source = readFile('src/store/useVibeController.ts');

    expect(source).toContain('audioLevel');
    expect(source).toContain('setAudioLevel');
  });
});

// ==============================================================================
// TEST 8: Type Safety
// ==============================================================================

describe('Vibe Types', () => {
  test('vibe.ts exists with type definitions', () => {
    expect(fileExists('src/types/vibe.ts')).toBe(true);
  });

  test('VibeColorTheme type is defined', () => {
    const source = readFile('src/types/vibe.ts');

    expect(source).toContain('VibeColorTheme');
    expect(source).toContain('TRUST');
    expect(source).toContain('PASSION');
    expect(source).toContain('CAUTION');
    expect(source).toContain('GROWTH');
    expect(source).toContain('DEEP');
  });

  test('VibeComplexity type is defined', () => {
    const source = readFile('src/types/vibe.ts');

    expect(source).toContain('VibeComplexity');
  });

  test('OrbEnergy type is defined', () => {
    const source = readFile('src/types/vibe.ts');

    expect(source).toContain('OrbEnergy');
    expect(source).toContain('CALM');
    expect(source).toContain('ENGAGED');
    expect(source).toContain('EXCITED');
  });

  test('AppState includes key demo states', () => {
    const source = readFile('src/types/vibe.ts');

    // Core states in AppState type
    const states = [
      'COACH_INTRO',
      'SEARCHING',
      'COACH',
    ];

    states.forEach(state => {
      expect(source).toContain(`'${state}'`);
    });
  });
});

// ==============================================================================
// TEST 9: LiquidGlass4 Orb
// ==============================================================================

describe('LiquidGlass4 Orb', () => {
  test('LiquidGlass4.tsx exists', () => {
    expect(fileExists('src/components/layers/LiquidGlass4.tsx')).toBe(true);
  });

  test('LiquidGlass4 uses Skia Canvas', () => {
    const source = readFile('src/components/layers/LiquidGlass4.tsx');

    expect(source).toContain("from '@shopify/react-native-skia'");
    expect(source).toContain('Canvas');
  });

  test('LiquidGlass4 has audioLevel prop for reactivity', () => {
    const source = readFile('src/components/layers/LiquidGlass4.tsx');

    expect(source).toContain('audioLevel');
  });

  test('LiquidGlass4 is used by AbbyOrb', () => {
    const source = readFile('src/components/layers/AbbyOrb/index.tsx');

    expect(source).toContain("from '../LiquidGlass4'");
    expect(source).toContain('<LiquidGlass4');
  });
});

// ==============================================================================
// TEST 10: Performance Considerations
// ==============================================================================

describe('Performance Patterns', () => {
  test('VibeMatrixAnimated uses useMemo for shader compilation', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain('useMemo');
    expect(source).toContain('RuntimeEffect.Make');
  });

  test('useDerivedValue is used for animated uniforms', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain('useDerivedValue');
  });
});
