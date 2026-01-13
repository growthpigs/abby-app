/**
 * InterviewScreen - Question flow with vibe shifts
 *
 * UI Layout:
 * - Top: Empty space for shader/orb
 * - Bottom: Glass modal with question + Next button (extends to screen edge)
 *
 * Text uses white with subtle shadow for readability on all shader backgrounds.
 *
 * API Integration:
 * - When authenticated: Uses /v1/questions/* API via QuestionsService
 * - Demo mode: Falls back to local ALL_DATA_POINTS
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDemoStore } from '../../store/useDemoStore';
import { useVibeController } from '../../store/useVibeController';
import { ALL_DATA_POINTS } from '../../data/questions-schema';
import { isValidVibeTheme, VibeColorTheme } from '../../types/vibe';
import { abbyTTS } from '../../services/AbbyTTSService';
import { getShaderForVibe, DEFAULT_VIBE_SHADERS } from '../../constants/vibeShaderMap';
import { questionsService, type Question, type NextQuestionResponse } from '../../services/QuestionsService';
import { TokenManager } from '../../services/TokenManager';
import { type VibeShift } from '../../data/questions-schema';

// Use the full 150 questions for demo/fallback mode
const DEMO_QUESTIONS = ALL_DATA_POINTS;

/**
 * Get emotionally-appropriate shader for a vibe theme
 * Selects from the vibe's shader group with variety based on index
 */
const getShaderForVibeAndIndex = (
  theme: VibeColorTheme | null,
  vibeChangeCount: number
): number => {
  if (!theme) {
    // Default to TRUST if no vibe specified
    return DEFAULT_VIBE_SHADERS.TRUST;
  }
  // Cycle through the vibe's shader group based on how many times we've changed vibes
  return getShaderForVibe(theme, vibeChangeCount);
};

export interface InterviewScreenProps {
  onBackgroundChange?: (index: number) => void;
  onSecretBack?: () => void;
  onSecretForward?: () => void;
}

// Unified question type for both API and local questions
interface DisplayQuestion {
  id: string;
  question: string;
  vibe_shift?: VibeShift;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  onBackgroundChange,
  onSecretBack,
  onSecretForward,
}) => {
  // Demo store for fallback mode
  const currentDemoIndex = useDemoStore((state) => state.currentQuestionIndex);
  const answerQuestion = useDemoStore((state) => state.answerQuestion);
  const nextQuestion = useDemoStore((state) => state.nextQuestion);
  const advance = useDemoStore((state) => state.advance);
  const addMessage = useDemoStore((state) => state.addMessage);

  const setColorTheme = useVibeController((state) => state.setColorTheme);
  const setAudioLevel = useVibeController((state) => state.setAudioLevel);
  const insets = useSafeAreaInsets();

  // API state
  const [isApiMode, setIsApiMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentApiQuestion, setCurrentApiQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState({ current: 1, total: 10 });
  const [hasMore, setHasMore] = useState(true);
  const answerStartTime = useRef<number>(Date.now());

  // Track TTS errors for user feedback
  const [voiceError, setVoiceError] = useState(false);

  // Prevent double-submission during API calls
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track current vibe for emotion-based texture selection
  const [currentVibe, setCurrentVibe] = useState<VibeColorTheme>('TRUST');
  const [vibeChangeCount, setVibeChangeCount] = useState(0);

  // Ref for audio level callback
  const audioLevelRef = useRef(setAudioLevel);
  audioLevelRef.current = setAudioLevel;

  // Derive current question based on mode
  const currentQuestion: DisplayQuestion | null = isApiMode
    ? currentApiQuestion
      ? {
          id: currentApiQuestion.id,
          question: currentApiQuestion.text,
          vibe_shift: currentApiQuestion.metadata?.vibe_shift as VibeShift | undefined,
        }
      : null
    : DEMO_QUESTIONS[Math.min(currentDemoIndex, DEMO_QUESTIONS.length - 1)];

  const isLastQuestion = isApiMode ? !hasMore : currentDemoIndex >= DEMO_QUESTIONS.length - 1;
  const displayProgress = isApiMode
    ? `${progress.current}/${progress.total}`
    : `${currentDemoIndex + 1}/${DEMO_QUESTIONS.length}`;

  // Initialize: Check auth and load first question
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setIsLoading(true);
      setApiError(null);

      try {
        const token = await TokenManager.getToken();
        if (!isMounted) return; // Prevent state updates after unmount

        if (token) {
          // Authenticated - use API
          if (__DEV__) console.log('[Interview] Authenticated, using API mode');
          setIsApiMode(true);

          // Fetch first question inline to use isMounted check
          try {
            answerStartTime.current = Date.now();
            const response = await questionsService.getNextQuestion();
            if (!isMounted) return;

            setCurrentApiQuestion(response.question);
            setProgress(response.progress);
            setHasMore(response.hasMore);
          } catch (fetchError) {
            if (!isMounted) return;
            if (__DEV__) console.error('[Interview] Fetch error:', fetchError);
            setIsApiMode(false); // Fallback to demo
          }
        } else {
          // Demo mode - use local questions
          if (__DEV__) console.log('[Interview] No token, using demo mode');
          setIsApiMode(false);
        }
      } catch (error) {
        if (!isMounted) return;
        if (__DEV__) console.error('[Interview] Init error:', error);
        // Fallback to demo mode on error
        setIsApiMode(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally run once on mount

  // Fetch next question from API
  const fetchNextQuestion = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      answerStartTime.current = Date.now();

      const response: NextQuestionResponse = await questionsService.getNextQuestion();

      setCurrentApiQuestion(response.question);
      setProgress(response.progress);
      setHasMore(response.hasMore);

      if (__DEV__) {
        console.log('[Interview] API question:', response.question.text);
        console.log('[Interview] Progress:', `${response.progress.current}/${response.progress.total}`);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Failed to load question';
      if (__DEV__) console.error('[Interview] Fetch error:', error);
      setApiError(errMsg);

      // Fallback to demo mode on persistent errors
      if (!currentApiQuestion) {
        if (__DEV__) console.log('[Interview] Falling back to demo mode');
        setIsApiMode(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer to API
  const submitApiAnswer = async (answerValue: string) => {
    if (!currentApiQuestion) return;

    const responseTime = Date.now() - answerStartTime.current;

    try {
      await questionsService.submitAnswer(
        currentApiQuestion.id,
        answerValue,
        responseTime
      );

      if (__DEV__) console.log('[Interview] Answer submitted to API');

      if (hasMore) {
        await fetchNextQuestion();
      } else {
        // Interview complete
        advance();
      }
    } catch (error) {
      if (__DEV__) console.error('[Interview] Submit error:', error);
      // Still advance even on error (don't block user)
      if (hasMore) {
        await fetchNextQuestion();
      } else {
        advance();
      }
    }
  };

  // Submit answer (handles both API and demo mode)
  const submitAnswer = useCallback(
    async (answerValue: string) => {
      // Guard against double-submission
      if (!currentQuestion || isSubmitting) return;

      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        // Add user response to conversation
        addMessage('user', answerValue);

        if (isApiMode) {
          // API mode - submit to backend
          await submitApiAnswer(answerValue);
        } else {
          // Demo mode - use local state
          answerQuestion({
            questionId: currentQuestion.id,
            value: answerValue,
            answeredAt: Date.now(),
          });

          if (isLastQuestion) {
            advance();
          } else {
            nextQuestion();
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentQuestion, isApiMode, isLastQuestion, isSubmitting, addMessage, answerQuestion, advance, nextQuestion, submitApiAnswer]
  );

  // Secret navigation handlers
  const handleSecretBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretBack?.();
  }, [onSecretBack]);

  const handleSecretForward = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSecretForward?.();
  }, [onSecretForward]);

  // Emotion-based texture selection: change shader when vibe changes
  useEffect(() => {
    if (onBackgroundChange) {
      const shaderId = getShaderForVibeAndIndex(currentVibe, vibeChangeCount);
      onBackgroundChange(shaderId);
      if (__DEV__) {
        console.log('[Interview] Shader →', shaderId, 'for vibe', currentVibe);
      }
    }
  }, [currentVibe, vibeChangeCount, onBackgroundChange]);

  // Speak question when it changes + trigger vibe shift
  useEffect(() => {
    if (!currentQuestion || isLoading) return;

    setVoiceError(false);

    // Trigger vibe_shift BEFORE speaking the question
    if (currentQuestion.vibe_shift && isValidVibeTheme(currentQuestion.vibe_shift)) {
      const newVibe = currentQuestion.vibe_shift as VibeColorTheme;
      setColorTheme(newVibe);

      if (newVibe !== currentVibe) {
        setCurrentVibe(newVibe);
        setVibeChangeCount((prev) => prev + 1);
      }
    }

    addMessage('abby', currentQuestion.question);

    abbyTTS
      .speak(currentQuestion.question, (level) => {
        audioLevelRef.current?.(level);
      })
      .catch((err) => {
        if (__DEV__) console.warn('[Interview] TTS error:', err);
        setVoiceError(true);
      });

    return () => {
      abbyTTS.stop();
    };
  }, [currentQuestion?.id, isLoading, setColorTheme, currentVibe]);

  // Loading state
  if (isLoading && !currentQuestion) {
    return (
      <View style={styles.container}>
        <View style={styles.topSpacer} />
        <View style={[styles.bottomModal, { bottom: -insets.bottom }]}>
          <BlurView intensity={80} tint="light" style={styles.modalBlur}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="rgba(0, 0, 0, 0.6)" />
              <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
            <View style={styles.homeIndicatorPadding} />
          </BlurView>
        </View>
      </View>
    );
  }

  // Error state (but still have a question to show)
  if (apiError && !currentQuestion) {
    return (
      <View style={styles.container}>
        <View style={styles.topSpacer} />
        <View style={[styles.bottomModal, { bottom: -insets.bottom }]}>
          <BlurView intensity={80} tint="light" style={styles.modalBlur}>
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>Unable to load questions</Text>
              <Pressable
                onPress={() => {
                  setIsApiMode(false);
                  setIsLoading(false);
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Use Demo Mode</Text>
              </Pressable>
            </View>
            <View style={styles.homeIndicatorPadding} />
          </BlurView>
        </View>
      </View>
    );
  }

  // No question available
  if (!currentQuestion) {
    return null;
  }

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
            {displayProgress}
            {isApiMode && <Text style={styles.apiIndicator}> • API</Text>}
          </Text>

          {/* Question text */}
          <Animated.View
            key={currentQuestion.id}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.questionContainer}
          >
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </Animated.View>

          {/* Voice error indicator */}
          {voiceError && <Text style={styles.voiceErrorText}>🔇 Voice unavailable</Text>}

          {/* API error banner (non-blocking) */}
          {apiError && (
            <Text style={styles.apiErrorText}>⚠️ Sync issue - answers saved locally</Text>
          )}

          {/* Loading overlay when fetching next */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="rgba(0, 0, 0, 0.4)" />
            </View>
          )}

          {/* Yes/No buttons */}
          {isLastQuestion ? (
            <Pressable
              onPress={() => submitAnswer('Yes')}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.nextButtonPressed,
                isLoading && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>Find My Match</Text>
            </Pressable>
          ) : (
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => submitAnswer('No')}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.answerButton,
                  styles.noButton,
                  pressed && styles.answerButtonPressed,
                  isLoading && styles.buttonDisabled,
                ]}
              >
                <Text style={[styles.answerButtonText, styles.noButtonText]}>No</Text>
              </Pressable>
              <Pressable
                onPress={() => submitAnswer('Yes')}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.answerButton,
                  styles.yesButton,
                  pressed && styles.answerButtonPressed,
                  isLoading && styles.buttonDisabled,
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

      {/* Secret navigation triggers (all 70x70, invisible) */}
      {/* Left = Back */}
      <Pressable onPress={handleSecretBack} style={styles.secretBackTrigger} hitSlop={10} />
      {/* Middle = Primary action (Submit Yes) */}
      <Pressable
        onPress={() => submitAnswer('Yes')}
        style={styles.secretMiddleTrigger}
        hitSlop={10}
      />
      {/* Right = Forward */}
      <Pressable onPress={handleSecretForward} style={styles.secretForwardTrigger} hitSlop={10} />
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
  apiIndicator: {
    color: 'rgba(59, 130, 246, 0.7)',
    fontSize: 10,
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
  apiErrorText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: 'rgba(180, 100, 0, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Loading
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 8,
    right: 16,
  },
  errorText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 16,
    color: 'rgba(180, 0, 0, 0.8)',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontFamily: 'Merriweather_400Regular',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
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
  buttonDisabled: {
    opacity: 0.5,
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

  // Secret navigation triggers
  secretBackTrigger: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  secretMiddleTrigger: {
    position: 'absolute',
    top: 10,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  secretForwardTrigger: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 70,
    height: 70,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
});

export default InterviewScreen;
