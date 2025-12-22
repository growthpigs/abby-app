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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DEMO_QUESTIONS } from '../../data/demo-questions';
import { VibeColorTheme } from '../../types/vibe';
import { ConversationOverlay } from '../ui/ConversationOverlay';
import { useSpeechRecognition } from '../../services/SpeechRecognition';
import { abbyVoice } from '../../services/AbbyVoice';

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
  const messages = useDemoStore((state) => state.messages);
  const addMessage = useDemoStore((state) => state.addMessage);

  const setColorTheme = useVibeController((state) => state.setColorTheme);
  const setAudioLevel = useVibeController((state) => state.setAudioLevel);
  const inputMode = useSettingsStore((state) => state.inputMode);

  // Derive current question and state (needed before callbacks)
  const currentQuestion = DEMO_QUESTIONS[Math.min(currentIndex, DEMO_QUESTIONS.length - 1)];
  const isLastQuestion = currentIndex >= DEMO_QUESTIONS.length - 1;

  // Check if voice is enabled (voice_only or voice_and_text mode)
  const voiceEnabled = inputMode === 'voice_only' || inputMode === 'voice_and_text';

  // Track TTS errors for user feedback
  const [voiceError, setVoiceError] = useState(false);

  // Ref for audio level callback to prevent memory leaks
  // (callback is created fresh each render, but AbbyVoice stores reference)
  const audioLevelRef = useRef(setAudioLevel);
  audioLevelRef.current = setAudioLevel;

  // Track if we already added Abby's message for current question
  const addedMessageForQuestion = useRef(-1);

  // Submit answer (from voice or button tap)
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

  // Speech recognition hook
  const {
    isListening,
    partialTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onResult: (transcript) => {
      if (transcript.trim()) {
        submitAnswer(transcript);
      }
    },
    onError: (error) => {
      if (__DEV__) console.log('[Interview] Speech error:', error);
    },
  });

  // Button tap handler (for text_only mode or manual advance)
  const handleAnswer = () => {
    submitAnswer('Answered'); // Default for button tap
  };

  // Calculate background index for current question
  React.useEffect(() => {
    if (onBackgroundChange) {
      onBackgroundChange(getBackgroundIndexForQuestion(currentIndex));
    }
  }, [currentIndex, onBackgroundChange]);

  // Add Abby's question to conversation and SPEAK it when it changes
  React.useEffect(() => {
    const question = DEMO_QUESTIONS[Math.min(currentIndex, DEMO_QUESTIONS.length - 1)];
    if (question) {
      // Reset error state for new question
      setVoiceError(false);

      // Add to transcript
      addMessage('abby', question.text);

      // Speak the question with Abby's voice (TTS)
      // Use ref for callback to prevent stale closure
      abbyVoice.speak(question.text, (level) => {
        audioLevelRef.current(level);
      }).catch((err) => {
        console.warn('[Interview] TTS error:', err);
        // Show error indicator to user
        setVoiceError(true);
      });
    }

    // Cleanup: stop any ongoing speech when question changes or unmounts
    return () => {
      abbyVoice.stop();
    };
  }, [currentIndex]);

  return (
    <View style={styles.container}>
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

        {/* Voice error indicator */}
        {voiceError && (
          <View style={styles.voiceErrorContainer}>
            <Text style={styles.voiceErrorText}>
              🔇 Voice unavailable - read text above
            </Text>
          </View>
        )}
      </View>

      {/* Bottom: Voice mic + Next button */}
      <View style={styles.bottomSection}>
        {/* Microphone button (for voice modes) */}
        {voiceEnabled && (
          <Pressable
            onPressIn={startListening}
            onPressOut={stopListening}
            style={({ pressed }) => [
              styles.micButton,
              pressed && styles.micButtonActive,
              isListening && styles.micButtonActive,
            ]}
          >
            <BlurView intensity={60} tint="dark" style={styles.micBlur}>
              <Text style={styles.micIcon}>{isListening ? '🔴' : '🎤'}</Text>
              <Text style={styles.micHint}>
                {isListening ? 'Listening...' : 'Hold to speak'}
              </Text>
            </BlurView>
          </Pressable>
        )}

        {/* Partial transcript display */}
        {partialTranscript ? (
          <View style={styles.partialContainer}>
            <Text style={styles.partialText}>{partialTranscript}</Text>
          </View>
        ) : null}

        {/* Next button (always visible, primary for text_only mode) */}
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

      {/* Conversation Overlay - scrolling chat transcript */}
      <ConversationOverlay
        messages={messages}
        inputMode={inputMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
  voiceErrorContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  voiceErrorText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 12,
    color: 'rgba(255, 180, 0, 0.9)',
    textAlign: 'center',
  },

  // BOTTOM - Voice mic + Next button
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  micButton: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  micButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  micBlur: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  micIcon: {
    fontSize: 28,
  },
  micHint: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  partialContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  partialText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    textAlign: 'center',
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
