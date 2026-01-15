/**
 * Question Sentiment Analyzer
 *
 * Analyzes question text to determine visual vibe parameters.
 * Maps emotional content to color theme, complexity, and shader texture.
 *
 * Design principle: Questions have emotional weight that should be reflected visually.
 * - Banal questions (favorite color) → calm blue, simple texture
 * - Vulnerable questions (past trauma) → deep violet, complex texture
 * - Passionate questions (love, commitment) → warm red, energetic texture
 */

import { VibeColorTheme, VibeComplexity } from '../types/vibe';
import { ShaderId } from '../shaders/factory/registryV2';
import { VIBE_SHADER_GROUPS } from '../constants/vibeShaderMap';

// =============================================================================
// SENTIMENT KEYWORDS
// Maps words/phrases to emotional categories
// =============================================================================

const SENTIMENT_KEYWORDS = {
  // TRUST (Blue) - Safe, getting-to-know-you
  TRUST: [
    'favorite', 'like', 'enjoy', 'hobby', 'weekend', 'music', 'movie', 'food',
    'travel', 'pet', 'job', 'work', 'morning', 'routine', 'ideal', 'first date',
    'fun', 'relax', 'free time', 'dream vacation', 'bucket list',
  ],

  // DEEP (Violet) - Vulnerable, intimate
  DEEP: [
    'vulnerable', 'afraid', 'fear', 'past', 'hurt', 'childhood', 'family',
    'trauma', 'loss', 'grief', 'insecurity', 'struggle', 'difficult', 'hard',
    'scared', 'lonely', 'understood', 'truly', 'deep', 'meaningful', 'soul',
    'regret', 'forgive', 'secret', 'never told', 'ashamed',
  ],

  // PASSION (Red/Pink) - Love, romance, intensity
  PASSION: [
    'love', 'romance', 'passion', 'desire', 'intimate', 'commit', 'forever',
    'marriage', 'partner', 'soulmate', 'heart', 'kiss', 'touch', 'attraction',
    'chemistry', 'spark', 'connection', 'destiny', 'future together', 'kids',
    'grow old', 'story', 'write together',
  ],

  // GROWTH (Green) - Personal development, aspirations
  GROWTH: [
    'learn', 'grow', 'improve', 'goals', 'dreams', 'aspire', 'become',
    'better', 'change', 'evolve', 'develop', 'potential', 'future', 'plan',
    'career', 'success', 'achieve', 'proud', 'accomplish', 'overcome',
    'passionate about', 'working on', 'excited about',
  ],

  // CAUTION (Orange) - Boundaries, dealbreakers, analysis
  CAUTION: [
    'dealbreaker', 'deal-breaker', 'red flag', 'warning', 'boundary',
    'non-negotiable', 'never', 'absolutely', 'must', 'require', 'expect',
    'opinion', 'think about', 'view on', 'stance', 'disagree', 'conflict',
    'argue', 'problem', 'issue', 'concern', 'worried',
  ],

  // ALERT (Grey) - Intervention, serious warnings
  ALERT: [
    'abuse', 'violent', 'unsafe', 'danger', 'help', 'emergency', 'crisis',
    'suicidal', 'harm', 'toxic', 'manipulate', 'control', 'stalk', 'threat',
  ],
} as const;

// =============================================================================
// COMPLEXITY INDICATORS
// Words that increase emotional intensity → higher complexity
// =============================================================================

const INTENSITY_BOOSTERS = [
  'truly', 'deeply', 'really', 'extremely', 'incredibly', 'absolutely',
  'completely', 'entirely', 'fundamentally', 'profoundly', 'intensely',
  'most', 'biggest', 'greatest', 'worst', 'best', 'ever', 'never',
];

const INTENSITY_DAMPENERS = [
  'maybe', 'sometimes', 'kind of', 'sort of', 'a little', 'slightly',
  'casual', 'simple', 'easy', 'basic', 'typical', 'normal', 'usual',
];

// =============================================================================
// TYPES
// =============================================================================

export interface SentimentResult {
  theme: VibeColorTheme;
  complexity: VibeComplexity;
  complexityValue: number; // 0.0 - 1.0 for shader uniform
  shaderId: ShaderId;
  confidence: number; // 0.0 - 1.0 how sure we are
}

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Analyze question text and return visual vibe parameters
 *
 * @param questionText - The question to analyze
 * @returns Sentiment result with theme, complexity, shader, and confidence
 *
 * Note: When multiple themes have equal scores, the first in iteration order wins:
 * TRUST < DEEP < PASSION < GROWTH < CAUTION < ALERT
 */
export function analyzeQuestionSentiment(questionText: string): SentimentResult {
  // Guard against null/undefined input - return safe defaults
  if (typeof questionText !== 'string' || !questionText) {
    return {
      theme: 'TRUST',
      complexity: 'SMOOTHIE',
      complexityValue: 0.3,
      shaderId: VIBE_SHADER_GROUPS.TRUST[0],
      confidence: 0.5,
    };
  }

  const text = questionText.toLowerCase();

  // 1. Score each theme based on keyword matches
  const scores: Record<VibeColorTheme, number> = {
    TRUST: 0,
    DEEP: 0,
    PASSION: 0,
    GROWTH: 0,
    CAUTION: 0,
    ALERT: 0,
  };

  // Count keyword matches for each theme
  for (const [theme, keywords] of Object.entries(SENTIMENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[theme as VibeColorTheme] += 1;
      }
    }
  }

  // 2. Determine winning theme (default to TRUST if no matches)
  let winningTheme: VibeColorTheme = 'TRUST';
  let maxScore = 0;
  let totalScore = 0;

  for (const [theme, score] of Object.entries(scores)) {
    totalScore += score;
    if (score > maxScore) {
      maxScore = score;
      winningTheme = theme as VibeColorTheme;
    }
  }

  // 3. Calculate complexity based on intensity modifiers
  let intensity = 0.3; // Base intensity

  // Boost intensity
  for (const booster of INTENSITY_BOOSTERS) {
    if (text.includes(booster)) {
      intensity += 0.15;
    }
  }

  // Dampen intensity
  for (const dampener of INTENSITY_DAMPENERS) {
    if (text.includes(dampener)) {
      intensity -= 0.1;
    }
  }

  // Theme-based intensity adjustment
  const themeIntensityBonus: Record<VibeColorTheme, number> = {
    TRUST: 0,
    GROWTH: 0.1,
    CAUTION: 0.2,
    DEEP: 0.3,
    PASSION: 0.35,
    ALERT: 0.5,
  };
  intensity += themeIntensityBonus[winningTheme];

  // Clamp to 0-1
  intensity = Math.max(0, Math.min(1, intensity));

  // 4. Map intensity to complexity level
  const complexity = intensityToComplexity(intensity);

  // 5. Select shader from theme group
  // Use intensity to pick from group (higher intensity = later in group)
  const shaderGroup = VIBE_SHADER_GROUPS[winningTheme];
  const shaderIndex = Math.floor(intensity * (shaderGroup.length - 0.01));
  const shaderId = shaderGroup[shaderIndex] ?? shaderGroup[0];

  // 6. Calculate confidence (how dominant the winning theme is)
  // If no keywords matched, default to 0.5 (neutral confidence)
  const confidence = totalScore > 0 ? Math.min(1, maxScore / totalScore) : 0.5;

  return {
    theme: winningTheme,
    complexity,
    complexityValue: intensity,
    shaderId,
    confidence,
  };
}

/**
 * Convert intensity (0-1) to complexity level
 */
function intensityToComplexity(intensity: number): VibeComplexity {
  if (intensity < 0.2) return 'SMOOTHIE';
  if (intensity < 0.4) return 'FLOW';
  if (intensity < 0.6) return 'OCEAN';
  if (intensity < 0.8) return 'STORM';
  return 'PAISLEY';
}

/**
 * Get a unique vibe permutation for a question
 * Uses question index for variety within same sentiment category
 */
export function getVibePermutation(
  questionText: string,
  questionIndex: number
): SentimentResult {
  const base = analyzeQuestionSentiment(questionText);

  // Add variation based on question index
  const shaderGroup = VIBE_SHADER_GROUPS[base.theme];
  const variedShaderIndex = (Math.floor(base.complexityValue * shaderGroup.length) + questionIndex) % shaderGroup.length;
  const variedShaderId = shaderGroup[variedShaderIndex];

  // Slight complexity variation
  const complexityVariation = ((questionIndex % 3) - 1) * 0.1; // -0.1, 0, +0.1
  const variedComplexity = Math.max(0, Math.min(1, base.complexityValue + complexityVariation));

  return {
    ...base,
    complexityValue: variedComplexity,
    complexity: intensityToComplexity(variedComplexity),
    shaderId: variedShaderId,
  };
}

export default analyzeQuestionSentiment;
