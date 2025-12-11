/**
 * InterviewScreen - Question flow with vibe shifts
 *
 * UI Layout:
 * - Top: "Question X of 10" + restart button (under dynamic island)
 * - Middle: Question card with glassmorphic backing + Merriweather font
 * - Bottom: Next question button
 *
 * Text uses white with subtle shadow for readability on all shader backgrounds.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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
  const reset = useDemoStore((state) => state.reset);

  const setColorTheme = useVibeController((state) => state.setColorTheme);
  const setCoveragePercent = useVibeController((state) => state.setCoveragePercent);

  // Restart demo handler
  const handleRestart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
  };

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

    // 4. Background update handled by useEffect below (single source of truth)
    // Removed duplicate onBackgroundChange call - was causing double transitions

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
      {/* Top: Question counter + restart button */}
      <View style={styles.topSection}>
        <View style={styles.topRow}>
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {DEMO_QUESTIONS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.progressDot,
                  idx <= currentIndex && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          {/* Restart button */}
          <Pressable onPress={handleRestart} style={styles.restartButton}>
            <Text style={styles.restartText}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.questionCounter}>
          Question {currentIndex + 1} of {DEMO_QUESTIONS.length}
        </Text>
      </View>

      {/* Middle: Question with glassmorphic backing + fade animation */}
      <View style={styles.middleSection}>
        <Animated.View
          key={currentQuestion.id}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <BlurView intensity={60} tint="dark" style={styles.questionCard}>
            <Text style={styles.questionText}>
              {currentQuestion.text}
            </Text>
          </BlurView>
        </Animated.View>
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
          <BlurView intensity={60} tint="dark" style={styles.buttonBlur}>
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

  // TOP - Question counter + progress
  topSection: {
    paddingTop: 60, // Below dynamic island
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  restartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  restartText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '300',
  },
  questionCounter: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  questionText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // BOTTOM - Next button
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default InterviewScreen;
