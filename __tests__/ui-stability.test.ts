/**
 * UI Stability Tests
 *
 * Validates:
 * 1. Status row alignment and styling
 * 2. VibeMatrix/Skia shader configuration
 * 3. Component structure integrity
 * 4. Animation and transition safety
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
// TEST 1: Status Row Alignment (UI Fix Validation)
// ==============================================================================

describe('Status Row Alignment', () => {
  test('CoachScreen status row uses flex alignment (not absolute)', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    // Check statusRow has correct flex properties
    expect(source).toContain("flexDirection: 'row'");
    expect(source).toContain("alignItems: 'center'");
  });

  test('CoachScreen mute button uses marginLeft auto (not absolute positioning)', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    // Extract muteButton style block
    const muteButtonMatch = source.match(/muteButton:\s*{[\s\S]*?},\n\s*muteButtonPressed/);
    expect(muteButtonMatch).toBeTruthy();

    const muteButtonStyle = muteButtonMatch![0];

    // Should have marginLeft: 'auto' for flex alignment
    expect(muteButtonStyle).toContain("marginLeft: 'auto'");

    // Should NOT have absolute positioning
    expect(muteButtonStyle).not.toContain("position: 'absolute'");
    expect(muteButtonStyle).not.toContain('top: 0');
    expect(muteButtonStyle).not.toContain('right: 16');
  });

  test('CoachIntroScreen mute button uses marginLeft auto (not absolute positioning)', () => {
    const source = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Extract muteButton style block
    const muteButtonMatch = source.match(/muteButton:\s*{[\s\S]*?},\n\s*muteButtonPressed/);
    expect(muteButtonMatch).toBeTruthy();

    const muteButtonStyle = muteButtonMatch![0];

    // Should have marginLeft: 'auto' for flex alignment
    expect(muteButtonStyle).toContain("marginLeft: 'auto'");

    // Should NOT have absolute positioning
    expect(muteButtonStyle).not.toContain("position: 'absolute'");
  });

  test('Status row has correct vertical spacing (marginTop: -15)', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Both should have the adjusted marginTop
    expect(coachSource).toContain('marginTop: -15');
    expect(introSource).toContain('marginTop: -15');
  });

  test('Status row does not have position: relative (cleaned up)', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Extract statusRow style block from both
    const coachMatch = coachSource.match(/statusRow:\s*{[\s\S]*?},\n\s*statusDot/);
    const introMatch = introSource.match(/statusRow:\s*{[\s\S]*?},\n\s*statusDot/);

    expect(coachMatch).toBeTruthy();
    expect(introMatch).toBeTruthy();

    // Should NOT have position: relative since we removed absolute from child
    expect(coachMatch![0]).not.toContain("position: 'relative'");
    expect(introMatch![0]).not.toContain("position: 'relative'");
  });
});

// ==============================================================================
// TEST 2: Mute Button Functionality
// ==============================================================================

describe('Mute Button UI', () => {
  test('Mute button uses design system dimensions', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    const muteButtonMatch = source.match(/muteButton:\s*{[\s\S]*?},\n\s*muteButtonPressed/);
    expect(muteButtonMatch).toBeTruthy();

    const style = muteButtonMatch![0];
    // Should use LAYOUT.backArrow.touchTarget for consistent touch targets
    expect(style).toContain('LAYOUT.backArrow.touchTarget');
    expect(style).toContain('borderRadius:');
  });

  test('Mute button uses lucide-react-native icons', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(coachSource).toContain("from 'lucide-react-native'");
    expect(coachSource).toContain('Pause');
    expect(coachSource).toContain('Play');

    expect(introSource).toContain("from 'lucide-react-native'");
  });

  test('Mute button has press feedback styles', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    expect(source).toContain('muteButtonPressed:');
    expect(source).toContain('opacity: 0.7');
    expect(source).toContain("transform: [{ scale: 0.95 }]");
  });
});

// ==============================================================================
// TEST 3: VibeMatrixAnimated Shader Configuration
// ==============================================================================

describe('VibeMatrixAnimated Shader System', () => {
  test('VibeMatrixAnimated.tsx exists and uses Skia Canvas', () => {
    expect(fileExists('src/components/layers/VibeMatrixAnimated.tsx')).toBe(true);

    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');
    expect(source).toContain("from '@shopify/react-native-skia'");
    expect(source).toContain('Canvas');
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

  test('VibeMatrixAnimated has fallback gradient when shader fails', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');
    // Fallback uses LinearGradient with FALLBACK_COLORS when shader compile fails
    expect(source).toContain('FALLBACK_COLORS');
    expect(source).toContain('LinearGradient');
    expect(source).toContain('if (!shader)');
  });
});

// ==============================================================================
// TEST 5: Shader Factory System
// ==============================================================================

describe('Shader Factory', () => {
  test('Factory index file exists', () => {
    expect(fileExists('src/shaders/factory/index.ts')).toBe(true);
  });

  test('Factory exports createShader function', () => {
    const source = readFile('src/shaders/factory/index.ts');
    expect(source).toContain('export function createShader');
  });

  test('All 19 shader presets exist in registryV2', () => {
    const { getAllShaders } = require('../src/shaders/factory/registryV2');
    expect(getAllShaders()).toHaveLength(19);
  });

  test('Background map exists and exports getShaderByIndex', () => {
    expect(fileExists('src/constants/backgroundMap.ts')).toBe(true);

    const source = readFile('src/constants/backgroundMap.ts');
    expect(source).toContain('export const getShaderByIndex');
    expect(source).toContain('export const TOTAL_SHADERS');
  });
});

// ==============================================================================
// TEST 6: Screen Component Structure
// ==============================================================================

describe('Screen Component Structure', () => {
  test('All required screens exist', () => {
    const screens = [
      'CoachIntroScreen.tsx',
      'CoachScreen.tsx',
      'InterviewScreen.tsx',
      'SearchingScreen.tsx',
      'MatchScreen.tsx',
      'PaymentScreen.tsx',
      'RevealScreen.tsx',
    ];

    screens.forEach(screen => {
      expect(fileExists(`src/components/screens/${screen}`)).toBe(true);
    });
  });

  test('Screens index exports all screens', () => {
    const source = readFile('src/components/screens/index.ts');

    const requiredExports = [
      'CoachIntroScreen',
      'CoachScreen',
      'InterviewScreen',
      'SearchingScreen',
      'MatchScreen',
      'PaymentScreen',
      'RevealScreen',
    ];

    requiredExports.forEach(exp => {
      expect(source).toContain(`export { ${exp} }`);
    });
  });
});

// ==============================================================================
// TEST 7: Animation Safety
// ==============================================================================

describe('Animation Safety', () => {
  test('CoachScreen uses Animated from react-native (for View transforms)', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    // Should use RN Animated for transforms and hook integration
    expect(source).toContain("Animated,");
    expect(source).toContain("from 'react-native'");
    // Animated.spring moved to useDraggableSheet hook
    expect(source).toContain('useDraggableSheet');
  });

  test('useDraggableSheet hook uses native driver and Animated.spring', () => {
    // PanResponder logic moved to shared hook
    const source = readFile('src/hooks/useDraggableSheet.ts');

    expect(source).toContain('useNativeDriver: true');
    expect(source).toContain('Animated.spring');
    expect(source).toContain('PanResponder.create');
  });

  test('VibeMatrixAnimated uses reanimated for derived values', () => {
    const source = readFile('src/components/layers/VibeMatrixAnimated.tsx');

    expect(source).toContain("from 'react-native-reanimated'");
    expect(source).toContain('useDerivedValue');
  });

  test('Transform arrays are properly formatted', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');

    // All transform properties should use array syntax
    expect(coachSource).toContain('transform: [');
    expect(coachSource).toContain('{ translateY }');
    expect(coachSource).toContain('{ scale:');
  });
});

// ==============================================================================
// TEST 8: Style Consistency
// ==============================================================================

describe('Style Consistency', () => {
  test('Both coach screens have mute button styling', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Both should have muteButton styles defined
    expect(coachSource).toContain('muteButton:');
    expect(introSource).toContain('muteButton:');

    // Both should have borderRadius for circular buttons
    expect(coachSource).toContain('borderRadius:');
    expect(introSource).toContain('borderRadius:');
  });

  test('Font families use design system constants', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Both should use TYPOGRAPHY constants (not hardcoded fonts)
    expect(coachSource).toContain('TYPOGRAPHY.body.fontFamily');
    expect(introSource).toContain('TYPOGRAPHY.body.fontFamily');

    expect(coachSource).toContain('TYPOGRAPHY.sectionLabel.fontFamily');
    expect(introSource).toContain('TYPOGRAPHY.sectionLabel.fontFamily');
  });

  test('Status text styles are consistent', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    // Both should have uppercase status text
    expect(coachSource).toContain("textTransform: 'uppercase'");
    expect(introSource).toContain("textTransform: 'uppercase'");
  });
});

// ==============================================================================
// TEST 9: BlurView Usage
// ==============================================================================

describe('BlurView Integration', () => {
  test('Coach screens use expo-blur', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(coachSource).toContain("from 'expo-blur'");
    expect(introSource).toContain("from 'expo-blur'");
  });

  test('BlurView has correct intensity and tint', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    expect(source).toContain('<BlurView');
    expect(source).toContain('intensity={80}');
    expect(source).toContain('tint="light"');
  });
});

// ==============================================================================
// TEST 10: Haptics Integration
// ==============================================================================

describe('Haptics Integration', () => {
  test('Coach screens use expo-haptics', () => {
    const coachSource = readFile('src/components/screens/CoachScreen.tsx');
    const introSource = readFile('src/components/screens/CoachIntroScreen.tsx');

    expect(coachSource).toContain("from 'expo-haptics'");
    expect(introSource).toContain("from 'expo-haptics'");
  });

  test('Haptics are used for button feedback', () => {
    const source = readFile('src/components/screens/CoachScreen.tsx');

    expect(source).toContain('Haptics.impactAsync');
    expect(source).toContain('ImpactFeedbackStyle.Medium');
    expect(source).toContain('ImpactFeedbackStyle.Light');
  });
});
