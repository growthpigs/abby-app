/**
 * InterviewScreen - Question flow with vibe shifts
 *
 * UI Layout:
 * - Top: "Question X of 10" in charcoal (under dynamic island)
 * - Middle: Question card with glassmorphic backing + Merriweather font
 * - Bottom: Next question button
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { DEMO_QUESTIONS } from '../../data/demo-questions';
import { VibeColorTheme } from '../../types/vibe';

// Returns the background index for shader progression
// Curated selection featuring the most beautiful shaders: 5, 1, 13, 8, 18, etc.
const BACKGROUND_SEQUENCE = [
  5,   // Q1: Liquid Marble - gorgeous opener
  1,   // Q2: Domain Warping fBM - classic
  13,  // Q3: Featured beautiful shader
  2,   // Q4: Warm Fire Swirls
  8,   // Q5: Deep Ocean - mid-point depth
  3,   // Q6: Neon Aurora Spirals
  18,  // Q7: Featured beautiful shader
  6,   // Q8: Kaleidoscope Bloom
  4,   // Q9: Aerial Reef
  10,  // Q10: Chromatic Bloom - finale
];

const getBackgroundIndexForQuestion = (questionIndex: number): number => {
  return BACKGROUND_SEQUENCE[questionIndex] || 1;
};

export interface InterviewScreenProps {
  onBackgroundChange?: (index: number) => void;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  onBackgroundChange,
}) => {
  const currentIndex = useDemoStore((state) => state.currentQuestionIndex);
  const answerQuestion = useDemoStore((state) => state.answerQuestion);
  const nextQuestion = useDemoStore((state) => state.nextQuestion);
  const advance = useDemoStore((state) => state.advance);

  const setColorTheme = useVibeController((state) => state.setColorTheme);
  const setCoveragePercent = useVibeController((state) => state.setCoveragePercent);

  const currentQuestion = DEMO_QUESTIONS[Math.min(currentIndex, DEMO_QUESTIONS.length - 1)];
  const isLastQuestion = currentIndex >= DEMO_QUESTIONS.length - 1;

  const handleAnswer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // 1. Trigger vibe_shift if present
    if (currentQuestion.vibe_shift) {
      setColorTheme(currentQuestion.vibe_shift as VibeColorTheme);
    }

    // 2. Record answer
    answerQuestion({
      questionId: currentQuestion.id,
      value: 'Demo answer',
      answeredAt: Date.now(),
    });

    // 3. Calculate new coverage and update vibe controller
    const newCoverage = ((currentIndex + 1) / DEMO_QUESTIONS.length) * 100;
    setCoveragePercent(newCoverage);

    // 4. Update background shader for next question
    if (!isLastQuestion && onBackgroundChange) {
      onBackgroundChange(getBackgroundIndexForQuestion(currentIndex + 1));
    }

    // 5. Next question or advance to searching
    if (isLastQuestion) {
      advance();
    } else {
      nextQuestion();
    }
  };

  // Calculate background index for current question
  React.useEffect(() => {
    if (onBackgroundChange) {
      onBackgroundChange(getBackgroundIndexForQuestion(currentIndex));
    }
  }, [currentIndex, onBackgroundChange]);

  return (
    <View style={styles.container}>
      {/* Top: Question counter in charcoal */}
      <View style={styles.topSection}>
        <Text style={styles.questionCounter}>
          Question {currentIndex + 1} of {DEMO_QUESTIONS.length}
        </Text>
      </View>

      {/* Middle: Question with glassmorphic backing (no dark tint) */}
      <View style={styles.middleSection}>
        <BlurView intensity={60} tint="light" style={styles.questionCard}>
          <Text style={styles.questionText}>
            {currentQuestion.text}
          </Text>
        </BlurView>
      </View>

      {/* Bottom: Next button */}
      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleAnswer}
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.nextButtonPressed,
          ]}
        >
          <BlurView intensity={60} tint="light" style={styles.buttonBlur}>
            <Text style={styles.buttonText}>
              {isLastQuestion ? 'Find My Match' : 'Next'}
            </Text>
          </BlurView>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // TOP - Question counter
  topSection: {
    paddingTop: 60, // Below dynamic island
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  questionCounter: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 14,
    color: '#333', // Charcoal
    letterSpacing: 0.5,
  },

  // MIDDLE - Question card
  middleSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  questionCard: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.08)', // Reduced gray tint
  },
  questionText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 17,
    lineHeight: 26,
    color: '#333',
    textAlign: 'center',
  },

  // BOTTOM - Next button
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40, // Reduced from 80 - moves button DOWN toward bottom edge
    alignItems: 'center',
  },
  nextButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  nextButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonBlur: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    // No backing card
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: '#999', // 30% lighter gray
  },
});

export default InterviewScreen;
