/**
 * Demo Questions - 10 questions for demo flow
 *
 * Each question has a vibe_shift that triggers visual changes.
 * Mix of themes to demonstrate all visual states.
 *
 * Coverage progression:
 * 0-20%   → TRUST (blue)
 * 20-40%  → DEEP (violet)
 * 40-60%  → GROWTH (green)
 * 60-80%  → CAUTION (orange)
 * 80-100% → PASSION (red)
 */

import { VibeColorTheme } from '../types/vibe';

export interface DemoQuestion {
  id: string;
  text: string;
  vibe_shift?: VibeColorTheme;
  category: string;
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  // Opening - TRUST theme (blue)
  {
    id: 'q1',
    text: "What's your ideal first date?",
    vibe_shift: 'TRUST',
    category: 'preferences',
  },
  {
    id: 'q2',
    text: "What made you want to find a meaningful connection?",
    vibe_shift: 'TRUST',
    category: 'motivation',
  },

  // Going deeper - DEEP theme (violet)
  {
    id: 'q3',
    text: "Tell me about a time you felt truly understood by someone.",
    vibe_shift: 'DEEP',
    category: 'emotional',
  },
  {
    id: 'q4',
    text: "What does vulnerability mean to you?",
    vibe_shift: 'DEEP',
    category: 'emotional',
  },

  // Growth potential - GROWTH theme (green)
  {
    id: 'q5',
    text: "What are you most passionate about right now?",
    vibe_shift: 'GROWTH',
    category: 'interests',
  },
  {
    id: 'q6',
    text: "How do you handle disagreements in relationships?",
    vibe_shift: 'GROWTH',
    category: 'communication',
  },

  // Building anticipation - CAUTION theme (orange)
  {
    id: 'q7',
    text: "What's a deal-breaker for you in a relationship?",
    vibe_shift: 'CAUTION',
    category: 'boundaries',
  },
  {
    id: 'q8',
    text: "What's something you're still learning about yourself?",
    vibe_shift: 'CAUTION',
    category: 'growth',
  },

  // Final reveal - PASSION theme (red)
  {
    id: 'q9',
    text: "What does commitment mean to you?",
    vibe_shift: 'PASSION',
    category: 'values',
  },
  {
    id: 'q10',
    text: "What kind of love story do you want to write?",
    vibe_shift: 'PASSION',
    category: 'vision',
  },
];

export default DEMO_QUESTIONS;
