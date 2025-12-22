/**
 * InterviewScreen - Question flow with vibe shifts
 *
 * UI Layout:
 * - Top: Empty space for shader/orb
 * - Bottom: Glass modal with question + Next button (extends to screen edge)
 *
 * Text uses white with subtle shadow for readability on all shader backgrounds.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { DEMO_QUESTIONS } from '../../data/demo-questions';
import { VibeColorTheme } from '../../types/vibe';
import { abbyVoice } from '../../services/AbbyVoice';

// Returns the background index for shader progression
const BACKGROUND_SEQUENCE = [
  5,   // Q1: Liquid Marble
  1,   // Q2: Domain Warping fBM
  13,  // Q3: Featured shader
  2,   // Q4: Warm Fire Swirls
  8,   // Q5: Deep Ocean
  3,   // Q6: Neon Aurora Spirals
  18,  // Q7: Featured shader
  6,   // Q8: Kaleidoscope Bloom
  4,   // Q9: Aerial Reef
  10,  // Q10: Chromatic Bloom
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
  const addMessage = useDemoStore((state) => state.addMessage);

  const setColorTheme = useVibeController((state) => state.setColorTheme);
  const setAudioLevel = useVibeController((state) => state.setAudioLevel);

  // Derive current question and state
  const currentQuestion = DEMO_QUESTIONS[Math.min(currentIndex, DEMO_QUESTIONS.length - 1)];
  const isLastQuestion = currentIndex >= DEMO_QUESTIONS.length - 1;

  // Track TTS errors for user feedback
  const [voiceError, setVoiceError] = useState(false);

  // Ref for audio level callback
  const audioLevelRef = useRef(setAudioLevel);
  audioLevelRef.current = setAudioLevel;

  // Submit answer and advance
  const submitAnswer = useCallback((answerValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Add user response to conversation
    addMessage('user', answerValue);

    // Trigger vibe_shift if present
    if (currentQuestion.vibe_shift) {
      setColorTheme(currentQuestion.vibe_shift as VibeColorTheme);
    }

    // Record answer
    answerQuestion({
      questionId: currentQuestion.id,
      value: answerValue,
      answeredAt: Date.now(),
    });

    // Next question or advance
    if (isLastQuestion) {
      advance();
    } else {
      nextQuestion();
    }
  }, [currentQuestion, isLastQuestion, addMessage, setColorTheme, answerQuestion, advance, nextQuestion]);

  // Button tap handler
  const handleAnswer = () => {
    submitAnswer('Answered');
  };

  // Calculate background index for current question
  useEffect(() => {
    if (onBackgroundChange) {
      onBackgroundChange(getBackgroundIndexForQuestion(currentIndex));
    }
  }, [currentIndex, onBackgroundChange]);

  // Speak question when it changes
  useEffect(() => {
    const question = DEMO_QUESTIONS[Math.min(currentIndex, DEMO_QUESTIONS.length - 1)];
    if (question) {
      setVoiceError(false);
      addMessage('abby', question.text);

      abbyVoice.speak(question.text, (level) => {
        audioLevelRef.current(level);
      }).catch((err) => {
        console.warn('[Interview] TTS error:', err);
        setVoiceError(true);
      });
    }

    return () => {
      abbyVoice.stop();
    };
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      {/* Top: Empty space for shader background + orb */}
      <View style={styles.topSpacer} />

      {/* Bottom: Glass modal with question + button - extends to screen edge */}
      <View style={styles.bottomModal}>
        <BlurView intensity={80} tint="light" style={styles.modalBlur}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Question text */}
          <Animated.View
            key={currentQuestion.id}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.questionContainer}
          >
            <Text style={styles.questionText}>
              {currentQuestion.text}
            </Text>
          </Animated.View>

          {/* Voice error indicator */}
          {voiceError && (
            <Text style={styles.voiceErrorText}>
              🔇 Voice unavailable
            </Text>
          )}

          {/* Next button */}
          <Pressable
            onPress={handleAnswer}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {isLastQuestion ? 'Find My Match' : 'Next'}
            </Text>
          </Pressable>

          {/* Extra padding for home indicator */}
          <View style={styles.homeIndicatorPadding} />
        </BlurView>
      </View>
    </View>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Top spacer - takes remaining space
  topSpacer: {
    flex: 1,
  },

  // Bottom modal - positioned at absolute bottom, extends past safe area to screen edge
  bottomModal: {
    position: 'absolute',
    bottom: -34, // Extend past safe area to reach actual screen bottom
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 8,
  },

  // Drag handle
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  // Question
  questionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  questionText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 20,
    lineHeight: 30,
    color: 'rgba(0, 0, 0, 0.85)',
    textAlign: 'center',
  },
  voiceErrorText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 12,
    color: 'rgba(180, 100, 0, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Next button
  nextButton: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Extra padding at bottom for home indicator
  homeIndicatorPadding: {
    height: 34,
  },
});

export default InterviewScreen;
