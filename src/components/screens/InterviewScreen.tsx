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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { ALL_DATA_POINTS } from '../../../docs/data/questions-schema';
import { isValidVibeTheme } from '../../types/vibe';
import { abbyVoice } from '../../services/AbbyVoice';

// Use the full 150 questions for interview mode
const INTERVIEW_QUESTIONS = ALL_DATA_POINTS;

// Background shaders cycle 1-10 continuously through all 150 questions
// Each question gets a background, cycling smoothly through all visuals
const getBackgroundIndexForQuestion = (questionIndex: number): number => {
  // Cycle through backgrounds 1-10 (10 total shaders)
  return (questionIndex % 10) + 1;
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
  const insets = useSafeAreaInsets();

  // Derive current question and state from 150 questions
  // Guard against empty array (defensive - should never happen but prevents crash)
  const safeIndex = INTERVIEW_QUESTIONS.length > 0
    ? Math.min(currentIndex, INTERVIEW_QUESTIONS.length - 1)
    : 0;
  const currentQuestion = INTERVIEW_QUESTIONS[safeIndex];
  const isLastQuestion = currentIndex >= INTERVIEW_QUESTIONS.length - 1;

  // Early return if no questions (should never happen, but prevents crash)
  if (!currentQuestion) {
    return null;
  }

  // Track TTS errors for user feedback
  const [voiceError, setVoiceError] = useState(false);

  // Ref for audio level callback
  const audioLevelRef = useRef(setAudioLevel);
  audioLevelRef.current = setAudioLevel;

  // Submit answer and advance
  // Note: vibe_shift is triggered when question LOADS, not when answered (more organic)
  const submitAnswer = useCallback((answerValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Add user response to conversation
    addMessage('user', answerValue);

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
  }, [currentQuestion, isLastQuestion, addMessage, answerQuestion, advance, nextQuestion]);

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

  // Speak question when it changes + trigger vibe shift BEFORE question is asked
  useEffect(() => {
    const question = INTERVIEW_QUESTIONS[Math.min(currentIndex, INTERVIEW_QUESTIONS.length - 1)];
    if (question) {
      setVoiceError(false);

      // Trigger vibe_shift BEFORE speaking the question (organic color transition)
      if (question.vibe_shift && isValidVibeTheme(question.vibe_shift)) {
        setColorTheme(question.vibe_shift);
      }

      addMessage('abby', question.question);

      abbyVoice.speak(question.question, (level) => {
        audioLevelRef.current?.(level);
      }).catch((err) => {
        console.warn('[Interview] TTS error:', err);
        setVoiceError(true);
      });
    }

    return () => {
      abbyVoice.stop();
    };
  }, [currentIndex, setColorTheme]);

  return (
    <View style={styles.container}>
      {/* Top: Empty space for shader background + orb */}
      <View style={styles.topSpacer} />

      {/* Bottom: Glass modal with question + button - extends to screen edge */}
      <View style={[styles.bottomModal, { bottom: -insets.bottom }]}>
        <BlurView intensity={80} tint="light" style={styles.modalBlur}>
          {/* Drag handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Progress indicator */}
          <Text style={styles.progressText}>
            {currentIndex + 1}/{INTERVIEW_QUESTIONS.length}
          </Text>

          {/* Question text */}
          <Animated.View
            key={currentQuestion.id}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.questionContainer}
          >
            <Text style={styles.questionText}>
              {currentQuestion.question}
            </Text>
          </Animated.View>

          {/* Voice error indicator */}
          {voiceError && (
            <Text style={styles.voiceErrorText}>
              🔇 Voice unavailable
            </Text>
          )}

          {/* Yes/No buttons */}
          {isLastQuestion ? (
            <Pressable
              onPress={() => submitAnswer('Yes')}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.nextButtonPressed,
              ]}
            >
              <Text style={styles.buttonText}>Find My Match</Text>
            </Pressable>
          ) : (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => submitAnswer('No')}
                style={({ pressed }) => [
                  styles.answerButton,
                  styles.noButton,
                  pressed && styles.answerButtonPressed,
                ]}
              >
                <Text style={[styles.answerButtonText, styles.noButtonText]}>No</Text>
              </Pressable>
              <Pressable
                onPress={() => submitAnswer('Yes')}
                style={({ pressed }) => [
                  styles.answerButton,
                  styles.yesButton,
                  pressed && styles.answerButtonPressed,
                ]}
              >
                <Text style={styles.answerButtonText}>Yes</Text>
              </Pressable>
            </View>
          )}

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

  // Progress indicator
  progressText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
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

  // Yes/No button row
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    gap: 12,
  },
  answerButton: {
    flex: 1,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  noButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  noButtonText: {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  yesButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.8)',
  },
  answerButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  answerButtonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Extra padding at bottom for home indicator
  homeIndicatorPadding: {
    height: 34,
  },
});

export default InterviewScreen;
