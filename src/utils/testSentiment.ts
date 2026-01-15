/**
 * Test Sentiment Analysis
 *
 * Run this in console to see how questions map to vibes.
 * Usage: Import and call testAllSentiments() in any component
 */

import { analyzeQuestionSentiment } from './questionSentiment';

const TEST_QUESTIONS = [
  // TRUST (Blue) - Casual
  "What's your favorite movie?",
  "What do you like to do on weekends?",
  "What kind of music do you enjoy?",

  // DEEP (Violet) - Vulnerable
  "What are you most afraid of?",
  "Tell me about a time you felt truly lonely",
  "What's a secret you've never told anyone?",

  // PASSION (Red) - Romance
  "Tell me about love and romance",
  "What does your soulmate look like?",
  "Describe your perfect kiss",

  // GROWTH (Green) - Aspirations
  "What are your career goals?",
  "What do you want to achieve in life?",
  "How do you plan to grow as a person?",

  // CAUTION (Orange) - Boundaries
  "What's your biggest dealbreaker?",
  "What red flags do you watch for?",
  "What's a non-negotiable for you?",

  // ALERT (Grey) - Intervention
  "Have you experienced abuse?",
  "Do you feel unsafe in relationships?",
  "Have you ever felt controlled?",
];

export function testAllSentiments(): void {
  console.log('\n========== SENTIMENT ANALYSIS TEST ==========\n');

  for (const question of TEST_QUESTIONS) {
    const result = analyzeQuestionSentiment(question);
    console.log(`Q: "${question.substring(0, 40)}..."`);
    console.log(`   → Theme: ${result.theme} | Complexity: ${result.complexity} | Shader: ${result.shaderId} | Conf: ${result.confidence.toFixed(2)}`);
    console.log('');
  }

  console.log('==============================================\n');
}

export function testQuestion(question: string): void {
  const result = analyzeQuestionSentiment(question);
  console.log('\n--- Sentiment Analysis ---');
  console.log(`Question: "${question}"`);
  console.log(`Theme:      ${result.theme}`);
  console.log(`Complexity: ${result.complexity} (${result.complexityValue.toFixed(2)})`);
  console.log(`Shader ID:  ${result.shaderId}`);
  console.log(`Confidence: ${result.confidence.toFixed(2)}`);
  console.log('--------------------------\n');
}

export default { testAllSentiments, testQuestion };
