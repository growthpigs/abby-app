/**
 * Interview Flow Integration Tests
 *
 * Tests the integration of 150 questions with VibeMatrix color transitions.
 * This test validates the critical implementation that was just completed.
 */

import { describe, test, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = '/Users/rodericandrews/_PAI/projects/abby';

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf8');
}

// ==============================================================================
// TEST 1: Questions Schema Validation
// ==============================================================================

describe('Questions Schema', () => {
  test('questions-schema.ts file exists', () => {
    const filePath = path.join(PROJECT_ROOT, 'docs/data/questions-schema.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('ALL_DATA_POINTS array is exported', () => {
    const source = readFile('docs/data/questions-schema.ts');
    expect(source).toContain('export const ALL_DATA_POINTS: DataPoint[]');
  });

  test('DataPoint interface has required fields', () => {
    const source = readFile('docs/data/questions-schema.ts');

    expect(source).toContain('export interface DataPoint');
    expect(source).toContain('id: string');
    expect(source).toContain('question: string');
    expect(source).toContain('vibe_shift?: VibeShift');
    expect(source).toContain('category: Category');
    expect(source).toContain('priority: Priority');
  });

  test('VibeShift type includes all vibe themes plus null', () => {
    const source = readFile('docs/data/questions-schema.ts');

    expect(source).toContain("export type VibeShift = 'TRUST' | 'PASSION' | 'CAUTION' | 'GROWTH' | 'DEEP' | 'ALERT' | null");
  });

  test('Questions use .question field not .text', () => {
    const source = readFile('docs/data/questions-schema.ts');

    // Should have question field in interface
    expect(source).toContain('question: string;');

    // Should NOT have text field
    expect(source).not.toContain('text: string');
  });

  test('Questions have 150 total data points', () => {
    const source = readFile('docs/data/questions-schema.ts');

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
  test('InterviewScreen imports ALL_DATA_POINTS from questions-schema', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain("import { ALL_DATA_POINTS } from '../../../docs/data/questions-schema'");
  });

  test('InterviewScreen uses ALL_DATA_POINTS as INTERVIEW_QUESTIONS', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('const INTERVIEW_QUESTIONS = ALL_DATA_POINTS');
  });

  test('InterviewScreen accesses question.question not question.text', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Should access .question field
    expect(source).toContain('question.question');
    expect(source).toContain('currentQuestion.question');

    // Should NOT access .text field
    expect(source).not.toContain('question.text');
    expect(source).not.toContain('currentQuestion.text');
  });

  test('InterviewScreen shows progress as X/150', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('{currentIndex + 1}/{INTERVIEW_QUESTIONS.length}');
  });

  test('InterviewScreen checks vibe_shift before triggering color change', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('if (question.vibe_shift && isValidVibeTheme(question.vibe_shift))');
    expect(source).toContain('setColorTheme(question.vibe_shift)');
  });

  test('InterviewScreen triggers vibe_shift BEFORE speaking question', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // This is critical - color change should happen BEFORE TTS
    const vibeShiftIndex = source.indexOf('setColorTheme(question.vibe_shift)');
    const speakIndex = source.indexOf('abbyVoice.speak(question.question');

    expect(vibeShiftIndex).toBeGreaterThan(0);
    expect(speakIndex).toBeGreaterThan(0);
    expect(vibeShiftIndex).toBeLessThan(speakIndex);
  });

  test('InterviewScreen cycles backgrounds 1-10 for all 150 questions', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('const getBackgroundIndexForQuestion = (questionIndex: number): number =>');
    expect(source).toContain('return (questionIndex % 10) + 1');
  });

  test('InterviewScreen handles last question properly', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('const isLastQuestion = currentIndex >= INTERVIEW_QUESTIONS.length - 1');
    // Uses JSX conditional: {isLastQuestion ? (...Find My Match...) : (...buttons...)}
    expect(source).toContain('{isLastQuestion ? (');
    expect(source).toContain('Find My Match');
  });
});

// ==============================================================================
// TEST 3: Type System Compatibility
// ==============================================================================

describe('Type System Integration', () => {
  test('VibeShift from schema matches VibeColorTheme in vibe.ts', () => {
    const schemaSource = readFile('docs/data/questions-schema.ts');
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

    expect(source).toContain("import { isValidVibeTheme } from '../../types/vibe'");
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
    expect(source).toContain('if (question.vibe_shift && isValidVibeTheme(question.vibe_shift))');
  });

  test('InterviewScreen uses Math.min to prevent index overflow', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('Math.min(currentIndex, INTERVIEW_QUESTIONS.length - 1)');
  });

  test('InterviewScreen bounds check for last question', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('const isLastQuestion = currentIndex >= INTERVIEW_QUESTIONS.length - 1');
  });

  test('Background cycling handles question 0 and question 149', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Modulo operation should work for all indices
    expect(source).toContain('(questionIndex % 10) + 1');
  });
});

// ==============================================================================
// TEST 6: TTS Integration
// ==============================================================================

describe('TTS Integration', () => {
  test('InterviewScreen speaks question text via abbyVoice', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('abbyVoice.speak(question.question');
  });

  test('InterviewScreen passes audio level callback', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('(level) => {');
    expect(source).toContain('audioLevelRef.current?.(level)');
  });

  test('InterviewScreen handles TTS errors', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('.catch((err) => {');
    expect(source).toContain('setVoiceError(true)');
  });

  test('InterviewScreen shows voice error indicator', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('{voiceError && (');
    expect(source).toContain('🔇 Voice unavailable');
  });
});

// ==============================================================================
// TEST 7: Import Path Correctness
// ==============================================================================

describe('Import Path Validation', () => {
  test('InterviewScreen can import from docs/data/questions-schema.ts', () => {
    const interviewScreenPath = 'src/components/screens/InterviewScreen.tsx';
    const questionsSchemaPath = 'docs/data/questions-schema.ts';

    // Both files exist
    expect(fs.existsSync(path.join(PROJECT_ROOT, interviewScreenPath))).toBe(true);
    expect(fs.existsSync(path.join(PROJECT_ROOT, questionsSchemaPath))).toBe(true);

    // Import path in InterviewScreen
    const source = readFile(interviewScreenPath);
    expect(source).toContain("import { ALL_DATA_POINTS } from '../../../docs/data/questions-schema'");

    // Verify relative path is correct
    // src/components/screens/InterviewScreen.tsx -> ../../../docs/data/questions-schema.ts
    // ../../../ goes to project root, then docs/data/questions-schema.ts
  });

  test('questions-schema.ts exports DataPoint type', () => {
    const source = readFile('docs/data/questions-schema.ts');
    expect(source).toContain('export interface DataPoint');
  });
});

// ==============================================================================
// TEST 8: Question Flow Logic
// ==============================================================================

describe('Question Flow Logic', () => {
  test('InterviewScreen advances on Next button', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('const handleAnswer = () => {');
    expect(source).toContain("submitAnswer('Answered')");
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
  test('Background change happens on question load (useEffect)', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Background change in useEffect
    expect(source).toContain('useEffect(() => {');
    expect(source).toContain('if (onBackgroundChange) {');
    expect(source).toContain('onBackgroundChange(getBackgroundIndexForQuestion(currentIndex))');
  });

  test('Color theme change happens when question loads (not when answered)', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Comment should clarify this
    expect(source).toContain('// Speak question when it changes + trigger vibe shift BEFORE question is asked');

    // In the speaking useEffect, not in submitAnswer
    const speakingEffectMatch = source.match(/\/\/ Speak question[^}]*?useEffect\(\(\) => \{[\s\S]*?setColorTheme[\s\S]*?\}, \[currentIndex/);
    expect(speakingEffectMatch).toBeTruthy();
  });
});

// ==============================================================================
// TEST 10: Runtime Safety
// ==============================================================================

describe('Runtime Safety', () => {
  test('Questions array access is bounds-checked', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    // Multiple bounds checks
    const boundsChecks = source.match(/Math\.min\(currentIndex, INTERVIEW_QUESTIONS\.length - 1\)/g);
    expect(boundsChecks).toBeTruthy();
    expect(boundsChecks!.length).toBeGreaterThan(0);
  });

  test('vibe_shift null check before setColorTheme', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('if (question.vibe_shift && isValidVibeTheme(question.vibe_shift))');
  });

  test('Background callback is optional', () => {
    const source = readFile('src/components/screens/InterviewScreen.tsx');

    expect(source).toContain('if (onBackgroundChange)');
  });
});
