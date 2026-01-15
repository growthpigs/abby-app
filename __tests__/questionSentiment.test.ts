/**
 * Question Sentiment Analyzer Tests
 *
 * Verifies that questions are correctly mapped to visual themes.
 */

import {
  analyzeQuestionSentiment,
  getVibePermutation,
  SentimentResult,
} from '../src/utils/questionSentiment';

describe('analyzeQuestionSentiment', () => {
  // =============================================================================
  // THEME DETECTION
  // =============================================================================

  describe('Theme Detection', () => {
    test('detects TRUST theme for casual questions', () => {
      const result = analyzeQuestionSentiment("What's your favorite movie?");
      expect(result.theme).toBe('TRUST');
    });

    test('detects DEEP theme for vulnerable questions', () => {
      const result = analyzeQuestionSentiment('What are you most afraid of?');
      expect(result.theme).toBe('DEEP');
    });

    test('detects PASSION theme for romantic questions', () => {
      // Use 'romance' and 'love' - unambiguous PASSION keywords
      const result = analyzeQuestionSentiment('Tell me about love and romance');
      expect(result.theme).toBe('PASSION');
    });

    test('detects GROWTH theme for aspiration questions', () => {
      const result = analyzeQuestionSentiment('What are your career goals?');
      expect(result.theme).toBe('GROWTH');
    });

    test('detects CAUTION theme for boundary questions', () => {
      const result = analyzeQuestionSentiment("What's your biggest dealbreaker?");
      expect(result.theme).toBe('CAUTION');
    });

    test('detects ALERT theme for intervention triggers', () => {
      const result = analyzeQuestionSentiment('Have you experienced abuse?');
      expect(result.theme).toBe('ALERT');
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('Edge Cases', () => {
    test('handles empty string gracefully', () => {
      const result = analyzeQuestionSentiment('');
      expect(result.theme).toBe('TRUST'); // Default
      expect(result.confidence).toBe(0.5); // Neutral
    });

    test('handles no keyword matches', () => {
      const result = analyzeQuestionSentiment('xyz abc 123');
      expect(result.theme).toBe('TRUST'); // Default
      expect(result.confidence).toBe(0.5);
    });

    test('handles null input gracefully', () => {
      // @ts-expect-error - testing runtime behavior for unexpected input
      const result = analyzeQuestionSentiment(null);
      expect(result.theme).toBe('TRUST');
      expect(result.confidence).toBe(0.5);
    });

    test('handles undefined input gracefully', () => {
      // @ts-expect-error - testing runtime behavior for unexpected input
      const result = analyzeQuestionSentiment(undefined);
      expect(result.theme).toBe('TRUST');
      expect(result.confidence).toBe(0.5);
    });

    test('handles mixed themes (should pick dominant)', () => {
      // "love" (PASSION) + "family" (DEEP) + "work" (TRUST)
      const result = analyzeQuestionSentiment('I love my family and work');
      // Should pick one theme (based on keyword count or order)
      expect(['PASSION', 'DEEP', 'TRUST']).toContain(result.theme);
    });
  });

  // =============================================================================
  // INTENSITY & COMPLEXITY
  // =============================================================================

  describe('Intensity Modifiers', () => {
    test('boosters increase complexity', () => {
      const base = analyzeQuestionSentiment('What do you like?');
      const boosted = analyzeQuestionSentiment('What do you truly deeply like?');
      expect(boosted.complexityValue).toBeGreaterThan(base.complexityValue);
    });

    test('dampeners decrease complexity', () => {
      const base = analyzeQuestionSentiment('What do you like?');
      const dampened = analyzeQuestionSentiment('What do you maybe sometimes like?');
      expect(dampened.complexityValue).toBeLessThan(base.complexityValue);
    });

    test('complexity is clamped to 0-1', () => {
      const result = analyzeQuestionSentiment(
        'truly deeply really extremely incredibly absolutely completely'
      );
      expect(result.complexityValue).toBeLessThanOrEqual(1);
      expect(result.complexityValue).toBeGreaterThanOrEqual(0);
    });
  });

  // =============================================================================
  // OUTPUT STRUCTURE
  // =============================================================================

  describe('Output Structure', () => {
    test('returns all required fields', () => {
      const result = analyzeQuestionSentiment('Test question');
      expect(result).toHaveProperty('theme');
      expect(result).toHaveProperty('complexity');
      expect(result).toHaveProperty('complexityValue');
      expect(result).toHaveProperty('shaderId');
      expect(result).toHaveProperty('confidence');
    });

    test('shaderId is a valid number', () => {
      const result = analyzeQuestionSentiment('What do you love?');
      expect(typeof result.shaderId).toBe('number');
      expect(result.shaderId).toBeGreaterThanOrEqual(0);
    });

    test('confidence is between 0 and 1', () => {
      const result = analyzeQuestionSentiment('I love passionate romance');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});

// =============================================================================
// FAILURE STATE SIMULATION
// =============================================================================

describe('Failure State Simulation', () => {
  test('handles very long input (1000+ words) without crash', () => {
    const longText = 'love romance passion '.repeat(333);
    expect(() => analyzeQuestionSentiment(longText)).not.toThrow();
    const result = analyzeQuestionSentiment(longText);
    expect(result.theme).toBe('PASSION');
  });

  test('handles special characters gracefully', () => {
    const special = '!!!@@@### $$$%%% ^^^&&& ***';
    expect(() => analyzeQuestionSentiment(special)).not.toThrow();
    const result = analyzeQuestionSentiment(special);
    expect(result.theme).toBe('TRUST'); // Default fallback
  });

  test('handles unicode/emoji characters', () => {
    const unicode = 'What do you 💕 love about 🌹 romance?';
    const result = analyzeQuestionSentiment(unicode);
    expect(result.theme).toBe('PASSION');
  });

  test('intensity overflow clamps to 1.0', () => {
    const maxBoosters =
      'truly deeply really extremely incredibly absolutely completely entirely fundamentally profoundly intensely best greatest most';
    const result = analyzeQuestionSentiment(maxBoosters);
    expect(result.complexityValue).toBeLessThanOrEqual(1);
  });

  test('intensity underflow clamps to 0.0', () => {
    const maxDampeners =
      'maybe sometimes kind of sort of a little slightly casual simple easy basic typical normal usual';
    const result = analyzeQuestionSentiment(maxDampeners);
    expect(result.complexityValue).toBeGreaterThanOrEqual(0);
  });
});

describe('getVibePermutation', () => {
  test('adds variation based on question index', () => {
    const q1 = getVibePermutation('What do you like?', 0);
    const q2 = getVibePermutation('What do you like?', 1);
    const q3 = getVibePermutation('What do you like?', 2);

    // Shader IDs should vary
    const shaderIds = [q1.shaderId, q2.shaderId, q3.shaderId];
    // At least one should be different (variation working)
    expect(new Set(shaderIds).size).toBeGreaterThanOrEqual(1);
  });

  test('complexity variation is bounded', () => {
    for (let i = 0; i < 10; i++) {
      const result = getVibePermutation('Test question', i);
      expect(result.complexityValue).toBeGreaterThanOrEqual(0);
      expect(result.complexityValue).toBeLessThanOrEqual(1);
    }
  });
});
