/**
 * EmotionVibeService - Dynamic Vibe Detection from Conversation
 *
 * Analyzes Abby's responses to detect emotional content and
 * maps emotions to vibe states for dynamic background changes.
 *
 * Emotion → Vibe Mapping:
 * - ENCOURAGEMENT → GROWTH (green) + FLOW
 * - CELEBRATION → PASSION (red) + STORM
 * - EMPATHY → DEEP (violet) + OCEAN
 * - CAUTION → CAUTION (orange) + OCEAN
 * - CURIOSITY → TRUST (blue) + FLOW
 * - REFLECTION → DEEP (violet) + SMOOTHIE
 * - EXCITEMENT → PASSION (red) + OCEAN
 * - CALM → GROWTH (green) + SMOOTHIE
 */

import { VibeColorTheme, VibeComplexity, OrbEnergy } from '../types/vibe';

// ========================================
// Emotion Categories
// ========================================

export type ConversationEmotion =
  | 'ENCOURAGEMENT'  // Supportive, positive reinforcement
  | 'CELEBRATION'    // Achievement, success, excitement
  | 'EMPATHY'        // Understanding, compassion, vulnerability
  | 'CAUTION'        // Warning, concern, careful consideration
  | 'CURIOSITY'      // Questions, exploration, interest
  | 'REFLECTION'     // Thoughtful, introspective, deep
  | 'EXCITEMENT'     // High energy, anticipation
  | 'CALM'           // Peaceful, reassuring, steady
  | 'NEUTRAL';       // Default/no strong emotion

// ========================================
// Emotion → Vibe Mapping
// ========================================

export interface EmotionVibeConfig {
  theme: VibeColorTheme;
  complexity: VibeComplexity;
  orbEnergy: OrbEnergy;
  backgroundIndex: number; // 1-10 for shader selection
}

export const EMOTION_VIBE_MAP: Record<ConversationEmotion, EmotionVibeConfig> = {
  ENCOURAGEMENT: {
    theme: 'GROWTH',
    complexity: 'FLOW',
    orbEnergy: 'ENGAGED',
    backgroundIndex: 5, // Liquid Marble - flowing, supportive
  },
  CELEBRATION: {
    theme: 'PASSION',
    complexity: 'STORM',
    orbEnergy: 'EXCITED',
    backgroundIndex: 10, // Chromatic Bloom - peak intensity
  },
  EMPATHY: {
    theme: 'DEEP',
    complexity: 'OCEAN',
    orbEnergy: 'CALM',
    backgroundIndex: 8, // Deep Ocean - emotional depth
  },
  CAUTION: {
    theme: 'CAUTION',
    complexity: 'OCEAN',
    orbEnergy: 'ENGAGED',
    backgroundIndex: 4, // Aerial Reef - alert but not alarming
  },
  CURIOSITY: {
    theme: 'TRUST',
    complexity: 'FLOW',
    orbEnergy: 'ENGAGED',
    backgroundIndex: 3, // Neon Aurora Spirals - exploratory
  },
  REFLECTION: {
    theme: 'DEEP',
    complexity: 'SMOOTHIE',
    orbEnergy: 'CALM',
    backgroundIndex: 7, // Ocean Shore - introspective
  },
  EXCITEMENT: {
    theme: 'PASSION',
    complexity: 'OCEAN',
    orbEnergy: 'EXCITED',
    backgroundIndex: 9, // Blob Metaballs - high energy
  },
  CALM: {
    theme: 'GROWTH',
    complexity: 'SMOOTHIE',
    orbEnergy: 'CALM',
    backgroundIndex: 5, // Liquid Marble - peaceful
  },
  NEUTRAL: {
    theme: 'GROWTH',
    complexity: 'FLOW',
    orbEnergy: 'CALM',
    backgroundIndex: 5, // Default coach background
  },
};

// ========================================
// Keyword Patterns for Emotion Detection
// ========================================

interface EmotionPattern {
  emotion: ConversationEmotion;
  keywords: string[];
  weight: number; // Higher = stronger match
}

const EMOTION_PATTERNS: EmotionPattern[] = [
  // CELEBRATION - Success and achievement
  {
    emotion: 'CELEBRATION',
    keywords: [
      'congratulations', 'amazing', 'fantastic', 'wonderful', 'incredible',
      'proud', 'achieved', 'success', 'perfect match', 'found someone',
      'exciting news', 'great job', 'well done', 'celebrate', 'thrilled',
    ],
    weight: 3,
  },
  // EXCITEMENT - High energy anticipation
  {
    emotion: 'EXCITEMENT',
    keywords: [
      'excited', 'can\'t wait', 'looking forward', 'thrilling', 'adventure',
      'amazing', 'wow', 'incredible', 'ready for', 'anticipating',
    ],
    weight: 2,
  },
  // EMPATHY - Emotional understanding
  {
    emotion: 'EMPATHY',
    keywords: [
      'understand', 'feel', 'heart', 'emotional', 'vulnerable', 'pain',
      'hurt', 'difficult', 'struggle', 'hard time', 'loss', 'grief',
      'lonely', 'scared', 'anxious', 'worried', 'sorry to hear',
      'must be difficult', 'i hear you', 'that sounds',
    ],
    weight: 3,
  },
  // ENCOURAGEMENT - Support and motivation
  {
    emotion: 'ENCOURAGEMENT',
    keywords: [
      'you can', 'believe in', 'trust yourself', 'keep going', 'don\'t give up',
      'you\'ve got this', 'support', 'encourage', 'strength', 'capable',
      'progress', 'growth', 'learning', 'improving', 'on the right path',
    ],
    weight: 2,
  },
  // CAUTION - Warnings and careful consideration
  {
    emotion: 'CAUTION',
    keywords: [
      'careful', 'warning', 'concern', 'red flag', 'watch out',
      'be aware', 'consider', 'think about', 'might want to',
      'potential issue', 'problem', 'risk', 'dangerous', 'toxic',
    ],
    weight: 3,
  },
  // CURIOSITY - Exploration and questions
  {
    emotion: 'CURIOSITY',
    keywords: [
      'tell me more', 'curious', 'interested', 'what about', 'how about',
      'explore', 'discover', 'wonder', 'fascinating', 'intriguing',
      'let\'s talk about', 'i\'d love to know', 'share more',
    ],
    weight: 2,
  },
  // REFLECTION - Deep thinking
  {
    emotion: 'REFLECTION',
    keywords: [
      'think about', 'reflect', 'consider', 'ponder', 'deep',
      'meaningful', 'important', 'values', 'beliefs', 'who you are',
      'what matters', 'purpose', 'journey', 'life', 'past experience',
    ],
    weight: 2,
  },
  // CALM - Reassurance and peace
  {
    emotion: 'CALM',
    keywords: [
      'relax', 'breathe', 'calm', 'peace', 'okay', 'alright',
      'no pressure', 'take your time', 'whenever you\'re ready',
      'no rush', 'steady', 'patient', 'gentle',
    ],
    weight: 2,
  },
];

// ========================================
// Emotion Detection Function
// ========================================

/**
 * Analyze text and detect the primary emotion
 */
export function detectEmotion(text: string): ConversationEmotion {
  if (!text || text.trim().length === 0) {
    return 'NEUTRAL';
  }

  const lowerText = text.toLowerCase();
  const scores: Map<ConversationEmotion, number> = new Map();

  // Initialize scores
  for (const pattern of EMOTION_PATTERNS) {
    scores.set(pattern.emotion, 0);
  }

  // Calculate scores based on keyword matches
  for (const pattern of EMOTION_PATTERNS) {
    let matchCount = 0;
    for (const keyword of pattern.keywords) {
      if (lowerText.includes(keyword)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      const currentScore = scores.get(pattern.emotion) || 0;
      scores.set(pattern.emotion, currentScore + matchCount * pattern.weight);
    }
  }

  // Find highest scoring emotion
  let maxEmotion: ConversationEmotion = 'NEUTRAL';
  let maxScore = 0;

  scores.forEach((score, emotion) => {
    if (score > maxScore) {
      maxScore = score;
      maxEmotion = emotion;
    }
  });

  // Require minimum score threshold
  if (maxScore < 2) {
    return 'NEUTRAL';
  }

  if (__DEV__) {
    console.log(`[EmotionVibe] Detected: ${maxEmotion} (score: ${maxScore})`);
  }

  return maxEmotion;
}

/**
 * Get vibe configuration for an emotion
 */
export function getVibeForEmotion(emotion: ConversationEmotion): EmotionVibeConfig {
  return EMOTION_VIBE_MAP[emotion];
}

/**
 * Analyze text and return the vibe configuration
 */
export function analyzeTextForVibe(text: string): EmotionVibeConfig {
  const emotion = detectEmotion(text);
  return getVibeForEmotion(emotion);
}
