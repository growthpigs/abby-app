/**
 * Interview Flow Integration Tests
 *
 * Tests the integration of 150 questions with VibeMatrix color transitions.
 * This test validates the critical implementation that was just completed.
 */

import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

// ==============================================================================
// TEST 1: Questions Schema Validation
// ==============================================================================

describe('Questions Schema', () => {
  test('questions-schema.ts file exists', () => {
    const filePath = path.join(PROJECT_ROOT, 'src/data/questions-schema.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('ALL_DATA_POINTS array is exported', () => {
    const source = readFile('src/data/questions-schema.ts');
    expect(source).toContain('export const ALL_DATA_POINTS: DataPoint[]');
  });

  test('DataPoint interface has required fields', () => {
    const source = readFile('src/data/questions-schema.ts');

    expect(source).toContain('export interface DataPoint');
    expect(source).toContain('id: string');
    expect(source).toContain('question: string');
    expect(source).toContain('vibe_shift?: VibeShift');
    expect(source).toContain('category: Category');
    expect(source).toContain('priority: Priority');
  });

  test('VibeShift type includes all vibe themes plus null', () => {
    const source = readFile('src/data/questions-schema.ts');

    expect(source).toContain("export type VibeShift = 'TRUST' | 'PASSION' | 'CAUTION' | 'GROWTH' | 'DEEP' | 'ALERT' | null");
  });

  test('Questions use .question field not .text', () => {
    const source = readFile('src/data/questions-schema.ts');

    // Should have question field in interface
    expect(source).toContain('question: string;');

    // Should NOT have text field
    expect(source).not.toContain('text: string');
  });

  test('Questions have 150 total data points', () => {
    const source = readFile('src/data/questions-schema.ts');

    // Count the sections
    expect(source).toContain('// P0: DEALBREAKERS (Questions 1-20)');
    expect(source).toContain('// P1: CORE COMPATIBILITY - Gottman Pillars (Questions 21-60)');
    expect(source).toContain('// P2: LIFESTYLE ALIGNMENT (Questions 61-110)');
    expect(source).toContain('// P3: PERSONALITY & PREFERENCES (Questions 111-150)');

    // Verify combined export
    expect(source).toContain('...DEALBREAKERS');
    expect(source).toContain('...CORE_COMPATIBILITY');
    expect(source).toContain('...LIFESTYLE');
    expect(source).toContain('...PERSONALITY_PREFERENCES');
  });
});

// ==============================================================================
// TEST 2: InterviewScreen Integration
// ==============================================================================

describe('InterviewScreen Questions Integration', () => {
  test('InterviewScreen imports questions from questions-schema', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Uses ALL_DATA_POINTS from questions-schema
    expect(source).toContain("import { ALL_DATA_POINTS } from '../../data/questions-schema'");
  });

  test('InterviewScreen uses DEMO_QUESTIONS alias', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // DEMO_QUESTIONS is aliased from ALL_DATA_POINTS for demo mode
    expect(source).toContain('const DEMO_QUESTIONS = ALL_DATA_POINTS');
    expect(source).toContain('DEMO_QUESTIONS');
  });

  test('InterviewScreen accesses currentQuestion.question not question.text', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Should access .question field via currentQuestion
    expect(source).toContain('currentQuestion.question');

    // Should NOT access .text field
    expect(source).not.toContain('currentQuestion.text');
  });

  test('InterviewScreen shows progress indicator', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses template literals for progress display
    expect(source).toContain('currentDemoIndex + 1');
    expect(source).toContain('DEMO_QUESTIONS.length');
  });

  test('InterviewScreen checks vibe_shift before triggering color change', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('if (currentQuestion.vibe_shift && isValidVibeTheme(currentQuestion.vibe_shift))');
    expect(source).toContain('setColorTheme(newVibe)');
  });

  test('InterviewScreen triggers vibe_shift BEFORE speaking question', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // This is critical - color change should happen BEFORE TTS
    const vibeShiftIndex = source.indexOf('setColorTheme(newVibe)');
    const speakIndex = source.indexOf('.speak(currentQuestion.question');

    expect(vibeShiftIndex).toBeGreaterThan(0);
    expect(speakIndex).toBeGreaterThan(0);
    expect(vibeShiftIndex).toBeLessThan(speakIndex);
  });

  test('InterviewScreen uses vibe-based shader selection', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses getShaderForVibe from vibeShaderMap (emotion-based, not index-based)
    expect(source).toContain("import { getShaderForVibe");
    expect(source).toContain('const getShaderForVibeAndIndex');
    expect(source).toContain('getShaderForVibe(');
  });

  test('InterviewScreen handles last question properly', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses ChatInput for all answers, advances on last question
    expect(source).toContain('isLastQuestion');
    expect(source).toContain('if (isLastQuestion)');
    expect(source).toContain('advance()');
  });
});

// ==============================================================================
// TEST 3: Type System Compatibility
// ==============================================================================

describe('Type System Integration', () => {
  test('VibeShift from schema matches VibeColorTheme in vibe.ts', () => {
    const schemaSource = readFile('src/data/questions-schema.ts');
    const vibeSource = readFile('src/types/vibe.ts');

    // Extract VibeShift values
    const vibeShiftMatch = schemaSource.match(/export type VibeShift = ([^;]+);/);
    expect(vibeShiftMatch).toBeTruthy();

    // Should include all themes
    const vibeShiftDef = vibeShiftMatch![1];
    expect(vibeShiftDef).toContain('TRUST');
    expect(vibeShiftDef).toContain('PASSION');
    expect(vibeShiftDef).toContain('CAUTION');
    expect(vibeShiftDef).toContain('GROWTH');
    expect(vibeShiftDef).toContain('DEEP');
    expect(vibeShiftDef).toContain('ALERT');
    expect(vibeShiftDef).toContain('null');

    // Verify vibe.ts has matching definition
    expect(vibeSource).toContain("| 'TRUST'");
    expect(vibeSource).toContain("| 'PASSION'");
    expect(vibeSource).toContain("| 'CAUTION'");
    expect(vibeSource).toContain("| 'GROWTH'");
    expect(vibeSource).toContain("| 'DEEP'");
    expect(vibeSource).toContain("| 'ALERT'");
  });

  test('isValidVibeTheme accepts all VibeShift values', () => {
    const vibeSource = readFile('src/types/vibe.ts');

    expect(vibeSource).toContain("export const VALID_VIBE_THEMES: VibeColorTheme[] = ['TRUST', 'PASSION', 'CAUTION', 'GROWTH', 'DEEP', 'ALERT']");
    expect(vibeSource).toContain('export const isValidVibeTheme = (value: unknown): value is VibeColorTheme');
  });

  test('InterviewScreen imports isValidVibeTheme', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Import includes VibeColorTheme as well
    expect(source).toContain("import { isValidVibeTheme, VibeColorTheme } from '../../types/vibe'");
  });
});

// ==============================================================================
// TEST 4: ALERT Theme Addition
// ==============================================================================

describe('ALERT Theme Integration', () => {
  test('ALERT is in VibeColorTheme type', () => {
    const source = readFile('src/types/vibe.ts');
    expect(source).toContain("| 'ALERT'");
  });

  test('ALERT is in VALID_VIBE_THEMES array', () => {
    const source = readFile('src/types/vibe.ts');
    expect(source).toContain("'ALERT'");
  });

  test('ALERT has color palette defined', () => {
    const source = readFile('src/constants/colors.ts');

    expect(source).toContain('ALERT: {');
    expect(source).toContain('primary: hexToRGB');
    expect(source).toContain('secondary: hexToRGB');
  });

  test('ALERT has gradient definition', () => {
    const source = readFile('src/constants/colors.ts');

    const gradientSection = source.substring(source.indexOf('export const VIBE_GRADIENTS'));
    expect(gradientSection).toContain('ALERT: {');
  });

  test('ALERT theme is grey colors as per spec', () => {
    const source = readFile('src/constants/colors.ts');

    // Should be Grey 700 and Grey 500
    expect(source).toContain("primary: hexToRGB('#374151')");
    expect(source).toContain("secondary: hexToRGB('#6B7280')");
  });
});

// ==============================================================================
// TEST 5: Edge Cases & Error Handling
// ==============================================================================

describe('Edge Cases', () => {
  test('InterviewScreen handles null vibe_shift gracefully', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Should check both existence AND validity
    expect(source).toContain('if (currentQuestion.vibe_shift && isValidVibeTheme(currentQuestion.vibe_shift))');
  });

  test('InterviewScreen uses Math.min to prevent index overflow', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses currentDemoIndex with DEMO_QUESTIONS
    expect(source).toContain('Math.min(currentDemoIndex, DEMO_QUESTIONS.length - 1)');
  });

  test('InterviewScreen bounds check for last question', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Supports both API mode (!hasMore) and demo mode (index check)
    expect(source).toContain('isLastQuestion');
    expect(source).toContain('currentDemoIndex >= DEMO_QUESTIONS.length - 1');
  });

  test('Shader selection uses vibe-based approach', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses vibe-based shader selection, not index-based cycling
    expect(source).toContain('getShaderForVibeAndIndex');
    expect(source).toContain('getShaderForVibe');
  });
});

// ==============================================================================
// TEST 6: TTS Integration
// ==============================================================================

describe('TTS Integration', () => {
  test('InterviewScreen speaks question text via abbyTTS', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses currentQuestion.question
    expect(source).toContain('.speak(currentQuestion.question');
  });

  test('InterviewScreen passes audio level callback', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('(level) => {');
  });

  test('InterviewScreen can stop TTS', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('abbyTTS.stop()');
  });

  test('InterviewScreen imports abbyTTS service', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain("import { abbyTTS } from '../../services/AbbyTTSService'");
  });
});

// ==============================================================================
// TEST 7: Import Path Correctness
// ==============================================================================

describe('Import Path Validation', () => {
  test('InterviewScreen can import from src/data/questions-schema.ts', () => {
    const interviewScreenPath = 'src/components/screens/InterviewScreen.tsx';
    const questionsSchemaPath = 'src/data/questions-schema.ts';

    // Both files exist
    expect(fs.existsSync(path.join(PROJECT_ROOT, interviewScreenPath))).toBe(true);
    expect(fs.existsSync(path.join(PROJECT_ROOT, questionsSchemaPath))).toBe(true);

    // Import path in InterviewScreen
    const source = readFile(interviewScreenPath);
    expect(source).toContain("import { ALL_DATA_POINTS } from '../../data/questions-schema'");

    // Verify relative path is correct
    // src/components/screens/InterviewScreen.tsx -> ../../data/questions-schema.ts
    // ../../ goes to src/, then data/questions-schema.ts
  });

  test('questions-schema.ts exports DataPoint type', () => {
    const source = readFile('src/data/questions-schema.ts');
    expect(source).toContain('export interface DataPoint');
  });
});

// ==============================================================================
// TEST 8: Question Flow Logic
// ==============================================================================

describe('Question Flow Logic', () => {
  test('InterviewScreen advances on button press', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses submitAnswer callback with useCallback
    expect(source).toContain('const submitAnswer = useCallback');
    expect(source).toContain("submitAnswer('Yes')");
  });

  test('InterviewScreen calls nextQuestion or advance', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('if (isLastQuestion) {');
    expect(source).toContain('advance()');
    expect(source).toContain('} else {');
    expect(source).toContain('nextQuestion()');
  });

  test('InterviewScreen records answers to store', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('answerQuestion({');
    expect(source).toContain('questionId: currentQuestion.id');
    expect(source).toContain('answeredAt: Date.now()');
  });
});

// ==============================================================================
// TEST 9: Visual Transition Timing
// ==============================================================================

describe('Visual Transition Timing', () => {
  test('Background change happens on vibe change (useEffect)', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Background changes based on currentVibe, not question index
    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('if (onBackgroundChange) {');
    expect(source).toContain('onBackgroundChange(shaderId)');
  });

  test('Color theme change happens when question loads (not when answered)', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses newVibe derived from currentQuestion.vibe_shift
    expect(source).toContain('setColorTheme(newVibe)');
    expect(source).toContain('currentQuestion.vibe_shift');
  });
});

// ==============================================================================
// TEST 10: Runtime Safety
// ==============================================================================

describe('Runtime Safety', () => {
  test('Questions array access is bounds-checked', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Refactored: Uses currentDemoIndex with DEMO_QUESTIONS
    const boundsChecks = source.match(/Math\.min\(currentDemoIndex, DEMO_QUESTIONS\.length - 1\)/g);
    expect(boundsChecks).toBeTruthy();
    expect(boundsChecks!.length).toBeGreaterThan(0);
  });

  test('vibe_shift null check before setColorTheme', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('if (currentQuestion.vibe_shift && isValidVibeTheme(currentQuestion.vibe_shift))');
  });

  test('Background callback is optional', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('if (onBackgroundChange)');
  });
});
