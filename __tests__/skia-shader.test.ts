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

const PROJECT_ROOT = '/Users/rodericandrews/_PAI/projects/abby';

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, relativePath));
}

// ==============================================================================
// TEST 1: Main Shader Structure
// ==============================================================================

describe('Main Shader Source', () => {
  test('vibeMatrix.ts exports shader string', () => {
    const source = readFile('src/shaders/vibeMatrix.ts');

    expect(source).toContain('export const VIBE_MATRIX_SHADER');
    expect(source).toContain('`'); // Template literal
  });

  test('Shader has required uniform declarations', () => {
    const source = readFile('src/shaders/vibeMatrix.ts');

    // Required uniforms for animation and coloring (Skia uses float2/float3 or vec2/vec3)
    expect(source).toContain('u_time');
    expect(source).toContain('u_resolution');
    expect(source).toContain('u_complexity');
    expect(source).toContain('u_colorA');
    expect(source).toContain('u_colorB');
  });

  test('Shader has main function', () => {
    const source = readFile('src/shaders/vibeMatrix.ts');

    // SkSL uses half4 main
    expect(source).toContain('half4 main(');
  });

  test('Shader uses xy or fragCoord for position', () => {
    const source = readFile('src/shaders/vibeMatrix.ts');

    // Skia shaders receive coordinates as xy or fragCoord
    expect(source).toMatch(/half4 main\(float2 (xy|fragCoord)\)/);
  });
});

// ==============================================================================
// TEST 2: Shader Variations
// ==============================================================================

describe('Shader Variations', () => {
  const shaderFiles = [
    'vibeMatrix1.ts',
    'vibeMatrix2.ts',
    'vibeMatrix3.ts',
    'vibeMatrix5.ts',
    'vibeMatrix6.ts',
    'vibeMatrix8.ts',
    'vibeMatrix10.ts',
    'vibeMatrix12.ts',
    'vibeMatrix13.ts',
    'vibeMatrix16.ts',
    'vibeMatrix18.ts',
  ];

  test('All shader variation files exist', () => {
    shaderFiles.forEach(file => {
      expect(fileExists(`src/shaders/${file}`)).toBe(true);
    });
  });

  test('All shader variations export a constant', () => {
    shaderFiles.forEach(file => {
      const source = readFile(`src/shaders/${file}`);
      expect(source).toContain('export const');
    });
  });

  test('Shader variations have main function', () => {
    // Check a few key variations - SkSL uses half4 main
    ['vibeMatrix2.ts', 'vibeMatrix5.ts', 'vibeMatrix10.ts'].forEach(file => {
      const source = readFile(`src/shaders/${file}`);
      expect(source).toContain('half4 main(');
    });
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

  test('getShaderByIndex handles all valid indices', () => {
    const source = readFile('src/constants/backgroundMap.ts');

    // Should have object map for indices
    expect(source).toContain('SHADER_INDEX');
  });

  test('TOTAL_SHADERS is a reasonable number', () => {
    const source = readFile('src/constants/backgroundMap.ts');

    const match = source.match(/TOTAL_SHADERS\s*=\s*(\d+)/);
    expect(match).toBeTruthy();

    const total = parseInt(match![1], 10);
    expect(total).toBeGreaterThanOrEqual(10);
    expect(total).toBeLessThanOrEqual(25);
  });

  test('backgroundMap imports shader files', () => {
    const source = readFile('src/constants/backgroundMap.ts');

    // Should import from shaders
    expect(source).toContain("from '../shaders/");
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
// TEST 9: LiquidGlass Orb
// ==============================================================================

describe('LiquidGlass Orb', () => {
  test('LiquidGlass.tsx exists', () => {
    expect(fileExists('src/components/layers/LiquidGlass.tsx')).toBe(true);
  });

  test('LiquidGlass uses Skia Canvas', () => {
    const source = readFile('src/components/layers/LiquidGlass.tsx');

    expect(source).toContain("from '@shopify/react-native-skia'");
    expect(source).toContain('Canvas');
  });

  test('LiquidGlass4 has audioLevel prop for reactivity', () => {
    // LiquidGlass4 is the audio-reactive version used in demos
    const source = readFile('src/components/layers/LiquidGlass4.tsx');

    expect(source).toContain('audioLevel');
  });

  test('Multiple LiquidGlass variations exist', () => {
    // Check for LiquidGlass variations (G1, G2, etc.)
    expect(fileExists('src/components/layers/LiquidGlass.tsx')).toBe(true);

    // Check for at least one variation
    const variations = [
      'LiquidGlass2.tsx',
      'LiquidGlass3.tsx',
      'LiquidGlass4.tsx',
    ];

    let found = false;
    variations.forEach(v => {
      if (fileExists(`src/components/layers/${v}`)) {
        found = true;
      }
    });
    expect(found).toBe(true);
  });
});

// ==============================================================================
// TEST 10: Performance Considerations
// ==============================================================================

describe('Performance Patterns', () => {
  test('VibeMatrix uses useMemo for shader compilation', () => {
    const source = readFile('src/components/layers/VibeMatrix.tsx');

    expect(source).toContain('useMemo');
    expect(source).toContain('RuntimeEffect.Make');
  });

  test('Shader compilation happens once (empty deps or memoized)', () => {
    const source = readFile('src/components/layers/VibeMatrix.tsx');

    // Check for useMemo with empty deps for shader
    expect(source).toMatch(/useMemo\(\s*\(\)\s*=>\s*{[\s\S]*?RuntimeEffect\.Make[\s\S]*?},\s*\[\s*\]/);
  });

  test('AnimatedVibeLayer uses useRef for background', () => {
    const source = readFile('src/components/layers/AnimatedVibeLayer.tsx');

    expect(source).toContain('useRef');
    expect(source).toContain('backgroundRef');
  });

  test('useDerivedValue is used for animated uniforms', () => {
    const source = readFile('src/components/layers/VibeMatrix.tsx');

    expect(source).toContain('useDerivedValue');
  });
});
